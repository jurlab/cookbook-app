import anthropic
import os
import json
import re
import base64
import io
from typing import List, Dict
from PIL import Image, ImageEnhance, ImageOps
from app.schemas import OCRResult, OCRResponse

class OCRService:
    def __init__(self):
        # Use AsyncAnthropic for non-blocking calls
        self.client = anthropic.AsyncAnthropic(
            api_key=os.getenv('ANTHROPIC_API_KEY')
        )
        # Updated to the correct stable model
        self.model = "claude-sonnet-4-5"

    def _process_image(self, image_base64: str) -> str:
        """
        High-Fidelity processing for OCR.
        Prioritizes resolution and contrast over small file size.
        """
        # Strip header if present
        if "base64," in image_base64:
            image_base64 = image_base64.split("base64,")[1]
        
        try:
            image_data = base64.b64decode(image_base64)
            img = Image.open(io.BytesIO(image_data))
            
            # 1. Convert to Grayscale
            # Removes color noise (shadows, yellow paper) and reduces payload size
            # allowing us to send higher resolution.
            img = img.convert("L")

            # 2. Enhance Contrast
            # Increases the difference between the text (dark) and paper (light)
            contrast = ImageEnhance.Contrast(img)
            img = contrast.enhance(1.5) # Increase contrast by 50%

            # 3. Enhance Sharpness
            # Helps define the edges of small serif fonts found in indices
            sharpness = ImageEnhance.Sharpness(img)
            img = sharpness.enhance(2.0) # Double the sharpness

            # 4. Smart Resizing
            # Previous limit (1568) is too small for index text. 
            # Claude 3.5 Sonnet supports high res. We cap at 3200px (long edge)
            # which is roughly 4K quality, sufficient for tiny text.
            max_size = 3200 
            if max(img.size) > max_size:
                ratio = max_size / max(img.size)
                new_size = (int(img.width * ratio), int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # 5. Save as High-Quality JPEG
            buffer = io.BytesIO()
            # Quality=95 prevents "ringing" artifacts around text
            # optimize=True attempts to reduce size without losing quality
            img.save(buffer, format="JPEG", quality=95, optimize=True)
            
            return base64.b64encode(buffer.getvalue()).decode('utf-8')
            
        except Exception as e:
            print(f"Image processing warning: {e}")
            return image_base64

    async def extract_recipes_from_image(self, image_base64: str, cookbook_id: int = None) -> OCRResponse:
        processed_image = self._process_image(image_base64)
        
        prompt = """COOKBOOK INDEX EXTRACTION PROMPT - IMPROVED
==========================================

You are analyzing a cookbook index page. Please extract ALL recipe entries from this image.

STEP 1: IDENTIFY THE INDEX FORMAT
----------------------------------

First, determine which format the index uses:

**FORMAT A: HIERARCHICAL/INDENTED**
- Ingredient headers are left-aligned (may or may not have page numbers)
- Recipe entries are indented under ingredient headers
- Some recipes may appear as standalone entries (not indented)
- Example:
  apples
    sauerkraut with apple and orange 186
  Ashkenazi buns with potato and sour cream 94-5

**FORMAT B: INLINE/COLON-SEPARATED**
- Ingredient followed by colon (:) or semicolon (;)
- Multiple recipes listed inline after the ingredient, separated by commas
- Each recipe has page number immediately after its name
- Example:
  aioli: roasted potatoes with aioli and buttered pine nuts 78
  anchovies: green herb bagna cauda 64

**FORMAT C: MIXED OR OTHER**
- Combination of above formats
- Other organizational structures (bullets, numbers, etc.)
- Describe the format you observe

STEP 2: EXTRACT BASED ON FORMAT
--------------------------------

**IF FORMAT A (Hierarchical/Indented):**

For each recipe entry, identify:
1. Recipe name (exact text WITHOUT page number)
2. Page number(s) (separate from recipe name)
3. Ingredients under which it appears (from ingredient headers)

Rules:
- Ingredient headers themselves are NOT recipes (don't extract them)
- Same recipe appearing in multiple places = one entry with multiple ingredients
- Page numbers are ALWAYS at the end of the entry - exclude them from recipe name

**IF FORMAT B (Inline/Colon-Separated):**

For each recipe entry, identify:
1. Recipe name (exact text before the page number)
2. Page number(s) (number immediately after recipe name)
3. Ingredient it appears under (text before the colon)

Rules:
- Parse comma-separated recipe lists carefully
- Each recipe in the list belongs to the ingredient before the colon
- **CRITICAL**: Page numbers appear at the END of each recipe entry
- **CRITICAL**: Recipe name should NOT include the page number
- Watch for page ranges (e.g., "184-7" means pages 184-187)

CRITICAL PAGE NUMBER PARSING RULES:
------------------------------------

**How to identify page numbers:**
- Page numbers are ALWAYS numeric (may include hyphens for ranges)
- Page numbers appear at the END of each recipe entry
- Common patterns:
  * Single page: "recipe name 45"
  * Page range: "recipe name 94-5" or "recipe name 184-7"
  * Multiple pages: "recipe name 10, 25" (rare, but possible)

**How to separate recipe name from page number:**

1. **Find the last number(s) in the entry** - this is likely the page number
2. **Everything BEFORE that number is the recipe name**
3. **Remove trailing spaces from recipe name**

**Examples of correct parsing:**

CORRECT:
Input: "roasted potatoes with aioli and buttered pine nuts 78"
Output: 
- recipe_name: "roasted potatoes with aioli and buttered pine nuts"
- page_number: "78"

CORRECT:
Input: "Ashkenazi buns with potato and sour cream 94-5"
Output:
- recipe_name: "Ashkenazi buns with potato and sour cream"
- page_number: "94-5"

CORRECT:
Input: "cacio e pepe chickpeas 120-1"
Output:
- recipe_name: "cacio e pepe chickpeas"
- page_number: "120-1"

INCORRECT:
Input: "roasted potatoes with aioli and buttered pine nuts 78"
Output:
- recipe_name: "roasted potatoes with aioli and buttered pine nuts 78" ← WRONG! Page number included
- page_number: "78"

INCORRECT:
Input: "5 a-day toad-in-the-hole 106-9"
Output:
- recipe_name: "a-day toad-in-the-hole" ← WRONG! Lost the "5" which is part of recipe name
- page_number: "106-9"

**Edge case: Numbers in recipe names**

Some recipes legitimately have numbers in their names (e.g., "5 a-day toad-in-the-hole", "3-ingredient cake"). How to handle:

- The PAGE NUMBER is always the LAST number(s) at the END of the entry
- Numbers WITHIN the recipe name (not at the end) are part of the recipe name
- Split at the LAST occurrence of a number pattern

Example:
Input: "5 a-day toad-in-the-hole 106-9"
- "5 a-day toad-in-the-hole" = recipe name (5 is part of the name)
- "106-9" = page number (last numbers at the end)

STEP 3: OUTPUT FORMAT
---------------------

Return a JSON array with this structure:

[
  {
    "recipe_name": "exact recipe name from index WITHOUT page numbers",
    "page_number": "page number or range as written",
    "ingredients": ["ingredient1", "ingredient2", ...]
  }
]

**Validation checklist before outputting each entry:**
- [ ] Recipe name does NOT end with a number (unless that number is clearly part of the recipe name like "5 a-day")
- [ ] Page number is numeric (may include hyphen for ranges)
- [ ] Recipe name does NOT contain the page number
- [ ] Recipe name has been trimmed of trailing/leading spaces

IMPORTANT EXTRACTION RULES (ALL FORMATS):
------------------------------------------

1. **Exact text**: Extract recipe names EXACTLY as written (but WITHOUT page numbers)
2. **Page numbers**: Keep in original format (e.g., "94-5", "184-7", "52-3") and SEPARATE from recipe name
3. **Be thorough**: Extract EVERY recipe entry visible
4. **No ingredient headers**: Don't extract ingredient headers as recipes (e.g., "beetroot 56, 200" where numbers are ingredient info pages)
5. **Combine duplicates**: If same recipe appears multiple times, create ONE entry with all ingredients listed
6. **Handle ambiguity**: If unclear whether something is a recipe or ingredient header, use context clues (indentation, punctuation, capitalization)

EXAMPLES:
---------

**Example for Format A:**
{
  "recipe_name": "Ashkenazi buns with caramelised carrots and chicken",
  "page_number": "138",
  "ingredients": ["apricots", "buns"]
}

**Example for Format B:**
{
  "recipe_name": "roasted potatoes with aioli and buttered pine nuts",
  "page_number": "78",
  "ingredients": ["aioli"]
}

**Example with number in recipe name:**
{
  "recipe_name": "5 a-day toad-in-the-hole",
  "page_number": "106-9",
  "ingredients": ["beetroot", "celeriac"]
}

EDGE CASES TO WATCH FOR:
-------------------------

- Cross-references (e.g., "see also beetroot") - don't extract as recipes
- Sub-ingredients (e.g., "beef, minced" as subcategory of "beef")
- Page ranges vs. multiple page numbers
- Recipes with commas in their names (in Format B)
- Multi-line recipe names
- Special characters or diacritics
- Numbers that are part of recipe names (e.g., "3-ingredient", "5 a-day")

FINAL REMINDER:
---------------
Before you output your JSON, review each entry and ask:
"Does the recipe_name field contain any page numbers?"
If YES, remove them and put them only in the page_number field.

Be thorough - extract EVERY recipe entry you can see, ensuring recipe names are clean and page numbers are properly separated.
"""

        try:
            message = await self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": processed_image,
                                },
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ],
                    }
                ],
            )
            
            response_text = message.content[0].text
            raw_response = response_text  # Store raw response for debugging
            recipes_data = self._extract_json(response_text)
            
            recipes = [
                OCRResult(
                    recipe_name=r['recipe_name'],
                    page_number=str(r['page_number']),
                    ingredients=r['ingredients'] if isinstance(r['ingredients'], list) else [str(r['ingredients'])]
                ) for r in recipes_data
            ]
            
            confidence = "high" if len(recipes) > 0 else "low"
            
            return OCRResponse(
                cookbook_id=cookbook_id,
                recipes=recipes,
                confidence=confidence,
                raw_response=raw_response  # Include raw response
            )
            
        except Exception as e:
            print(f"OCR Error: {str(e)}")
            # In production, log this to Sentry/Datadog
            return OCRResponse(cookbook_id=cookbook_id, recipes=[], raw_response=f"Error: {str(e)}", confidence="error")

    def _extract_json(self, text: str) -> List[Dict]:
            """
            Robustly extract JSON from Claude's output, handling Markdown headers and text preambles.
            """
            try:
                # OPTION 1: Regex for Explicit Markdown Code Blocks (Most Reliable)
                # This looks for ```json [CONTENT] ```
                json_match = re.search(r"```json\s*(.*?)```", text, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group(1))

                # OPTION 2: Regex for Generic Code Blocks
                # This looks for ``` [CONTENT] ```
                code_match = re.search(r"```\s*(.*?)```", text, re.DOTALL)
                if code_match:
                    return json.loads(code_match.group(1))

                # OPTION 3: Brute Force Search (Fallback)
                # Finds the first '[' and the last ']' and assumes everything between is the JSON list
                start_index = text.find('[')
                end_index = text.rfind(']')
                
                if start_index != -1 and end_index != -1 and end_index > start_index:
                    json_str = text[start_index:end_index + 1]
                    return json.loads(json_str)
                
                # OPTION 4: Direct Parse (Rarely works if text is present)
                return json.loads(text)
                
            except json.JSONDecodeError as e:
                print(f"JSON Parse Error: {e}")
                # Log the problematic text to help debugging
                print(f"Failed Text Snippet: {text[:500]}...") 
                return []
            except Exception as e:
                print(f"General Extraction Error: {e}")
                return []

    def deduplicate_recipes(self, ocr_results: List[OCRResult]) -> List[OCRResult]:
        recipe_map: Dict[str, OCRResult] = {}
        for result in ocr_results:
            # Normalize keys to avoid case sensitivity dupes
            key = f"{result.recipe_name.lower().strip()}|{result.page_number}"
            
            if key in recipe_map:
                existing = set(recipe_map[key].ingredients)
                new_ing = set(result.ingredients)
                recipe_map[key].ingredients = list(existing | new_ing)
            else:
                recipe_map[key] = result
        return list(recipe_map.values())
