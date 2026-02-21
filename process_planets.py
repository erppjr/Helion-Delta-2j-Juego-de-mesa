import os
from PIL import Image

assets_dir = os.path.join("assets", "planets")

def process_image(filepath):
    """Convierte el blanco puro o casi puro en transparente y recorta el exceso."""
    try:
        img = Image.open(filepath).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Change all white (also shades of whites)
            # to transparent
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        
        # Encontrar el bounding box de las partes no transparentes
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(filepath, "PNG")
        print(f"Processed: {filepath}")
        
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    if not os.path.exists(assets_dir):
        print(f"Directory {assets_dir} does not exist.")
        exit(1)
        
    for filename in os.listdir(assets_dir):
        if filename.endswith(".png"):
            filepath = os.path.join(assets_dir, filename)
            process_image(filepath)
    print("All planets processed successfully.")
