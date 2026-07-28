from PIL import Image

def find_large_islands():
    img = Image.open('../frontend/public/logo.png')
    w, h = img.size
    pixels = img.convert('RGB')
    bg_color = (244, 246, 245)
    
    # Create a binary grid of 1024x558
    grid = []
    for y in range(h):
        row = []
        for x in range(w):
            p = pixels.getpixel((x, y))
            dist = sum(abs(c1 - c2) for c1, c2 in zip(p, bg_color))
            row.append(1 if dist > 35 else 0)
        grid.append(row)
        
    visited = [[False for _ in range(w)] for _ in range(h)]
    islands = []
    
    # BFS to find connected components
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if grid[y][x] == 1 and not visited[y][x]:
                min_x, max_x = x, x
                min_y, max_y = y, y
                queue = [(x, y)]
                visited[y][x] = True
                
                while queue:
                    cx, cy = queue.pop(0)
                    if cx < min_x: min_x = cx
                    if cx > max_x: max_x = cx
                    if cy < min_y: min_y = cy
                    if cy > max_y: max_y = cy
                    
                    for dx, dy in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            if grid[ny][nx] == 1 and not visited[ny][nx]:
                                visited[ny][nx] = True
                                queue.append((nx, ny))
                                
                islands.append((min_x, min_y, max_x, max_y))
                
    print("Large Components (Width > 20 and Height > 20):")
    for idx, (lx, uy, rx, ly) in enumerate(islands):
        width = rx - lx
        height = ly - uy
        if width > 20 and height > 20:
            print(f"Component {idx}: Box=({lx}, {uy}, {rx}, {ly}), Width={width}, Height={height}")

if __name__ == '__main__':
    find_large_islands()
