import os
from PIL import Image
from collections import deque

assets_dir = os.path.join("assets", "planets")
originals_dir = r"C:\Users\erppj\.gemini\antigravity\brain\5049e994-34d9-444e-8914-564c1f50defa"

# Mapa de la imagen original al archivo destino
files = {
    "earth.png": "planet_earth_1771689024068.png",
    "gas.png": "planet_gas_1771689038293.png",
    "mars.png": "planet_mars_1771689060299.png",
    "ice.png": "planet_ice_1771689144596.png",
    "ocean.png": "planet_ocean_1771689168160.png"
}

def process_image(src_path, dest_path):
    try:
        # Cargar la imagen original
        img = Image.open(src_path).convert("RGBA")
        width, height = img.size
        pixels = img.load()
        
        visited = set()
        queue = []
        
        # Añadir todos los píxeles del borde a la cola
        for x in range(width):
            queue.append((x, 0))
            queue.append((x, height - 1))
        for y in range(height):
            queue.append((0, y))
            queue.append((width - 1, y))
            
        def is_white(c):
            # Es un blanco/gris muy claro
            return c[0] > 240 and c[1] > 240 and c[2] > 240
            
        valid_queue = deque()
        for p in queue:
            if p not in visited:
                visited.add(p)
                if is_white(pixels[p[0], p[1]]):
                    valid_queue.append(p)
                    
        # BFS para hacer transparente el fondo preservando colores internos y nubes blancas
        while valid_queue:
            x, y = valid_queue.popleft()
            pixels[x, y] = (255, 255, 255, 0)
            
            for nx, ny in [(x-1, y), (x+1, y), (x, y-1), (x, y+1)]:
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        if is_white(pixels[nx, ny]):
                            valid_queue.append((nx, ny))
                            
        # Encontrar el bounding box exacto y recortar el lienzo
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(dest_path, "PNG")
        print(f"Procesado: {dest_path}")
    except Exception as e:
        print(f"Error procesando {dest_path}: {e}")

if __name__ == "__main__":
    for dest_name, src_name in files.items():
        src = os.path.join(originals_dir, src_name)
        dest = os.path.join(assets_dir, dest_name)
        process_image(src, dest)
