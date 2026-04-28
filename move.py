with open("src/app/page.tsx", "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "/* --- SWARM WORKFLOW --- */" in line:
        start_idx = i
    if "/* --- SWARM 3D BANNER --- */" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    section = lines[start_idx:end_idx]
    
    # Remove from original position
    del lines[start_idx:end_idx]
    
    # Find insert position (after Telemetry Ticker)
    insert_idx = -1
    for i, line in enumerate(lines):
        if "/* --- PRIMITIVES GRID --- */" in line:
            insert_idx = i
            break
            
    if insert_idx != -1:
        lines = lines[:insert_idx] + section + ["\n"] + lines[insert_idx:]
        
        with open("src/app/page.tsx", "w") as f:
            f.writelines(lines)
        print("Successfully moved SWARM WORKFLOW")
    else:
        print("Could not find insert position")
else:
    print("Could not find section to move")
