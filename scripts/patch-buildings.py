import pathlib
p = pathlib.Path("components/worlds/HiddenLeafWorld/Buildings.tsx")
t = p.read_text()

# Insert VillageInstances component before Buildings (memoized, band-filtered)
component = '''
type VillageData = ReturnType<typeof createVillage>;
type Band = (typeof BANDS)[number];

const VillageInstances = memo(function VillageInstances({ village, materials, roofGeometry, awningGeometry, band }: { village: VillageData; materials: VillageMaterials; roofGeometry: THREE.BufferGeometry; awningGeometry: THREE.BufferGeometry; band: Band }) {
  const houses = village.houses.filter((h) => inBand(h.z, band));
  const timber = village.timber.filter((x) => inBand(x.position[2], band));
  const wood = village.wood.filter((x) => inBand(x.position[2], band));
  const sills = village.sills.filter((x) => inBand(x.position[2], band));
  const litWindows = village.litWindows.filter((x) => inBand(x.position[2], band));
  const darkWindows = village.darkWindows.filter((x) => inBand(x.position[2], band));
  const doors = village.doors.filter((x) => inBand(x.position[2], band));
  const awnings = village.awnings.filter((x) => inBand(x.position[2], band));
  const noren = village.noren.filter((x) => inBand(x.position[2], band));
  const lanterns = village.lanterns.filter((x) => inBand(x[2], band));
  return (
    <group>
      <Instances limit={Math.max(houses.length, 1)} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={materials.wall} attach="material" />
        {houses.map((house, index) => (
          <Instance key={`wall-${index}`} position={[house.x, house.y + house.height / 2, house.z]} scale={[house.width, house.height, house.depth]} rotation={[0, house.rotation, 0]} color={WALL_COLORS[index % WALL_COLORS.length]} />
        ))}
      </Instances>
      <Instances limit={Math.max(houses.length, 1)} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={materials.foundation} attach="material" />
        {houses.map((house, index) => (
          <Instance key={`foundation-${index}`} position={[house.x, house.y + 0.12, house.z]} scale={[house.width * 1.08, 0.34, house.depth * 1.08]} rotation={[0, house.rotation, 0]} />
        ))}
      </Instances>
      <Instances limit={Math.max(houses.length, 1)} castShadow receiveShadow geometry={roofGeometry}>
        <primitive object={materials.roof} attach="material" />
        {houses.map((house, index) => (
          <Instance key={`roof-${index}`} position={[house.x, house.y + house.height, house.z]} scale={[house.width * 1.16, house.roofHeight, house.depth * 1.18]} rotation={[0, house.rotation, 0]} color={house.roofColor} />
        ))}
      </Instances>
      <Instances limit={Math.max(timber.length, 1)} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={materials.timber} attach="material" />
        {timber.map((piece, index) => <Instance key={`timber-${index}`} position={piece.position} scale={piece.scale} rotation={piece.rotation} />)}
      </Instances>
      <Instances limit={Math.max(wood.length, 1)} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={materials.wood} attach="material" />
        {wood.map((piece, index) => <Instance key={`wood-${index}`} position={piece.position} scale={piece.scale} rotation={piece.rotation} />)}
      </Instances>
      <Instances limit={Math.max(sills.length, 1)} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={materials.wood} attach="material" />
        {sills.map((piece, index) => <Instance key={`sill-${index}`} position={piece.position} scale={piece.scale} rotation={piece.rotation} />)}
      </Instances>
      <Instances limit={Math.max(litWindows.length, 1)}>
        <planeGeometry args={[1, 1]} />
        <primitive object={materials.shoji} attach="material" />
        {litWindows.map((w, index) => <Instance key={`lit-${index}`} position={w.position} scale={w.scale} rotation={w.rotation} />)}
      </Instances>
      <Instances limit={Math.max(darkWindows.length, 1)}>
        <planeGeometry args={[1, 1]} />
        <primitive object={materials.darkWindow} attach="material" />
        {darkWindows.map((w, index) => <Instance key={`dark-${index}`} position={w.position} scale={w.scale} rotation={w.rotation} />)}
      </Instances>
      <Instances limit={Math.max(doors.length, 1)}>
        <planeGeometry args={[1, 1]} />
        <primitive object={materials.door} attach="material" />
        {doors.map((d, index) => <Instance key={`door-${index}`} position={d.position} scale={d.scale} rotation={d.rotation} />)}
      </Instances>
      <Instances limit={Math.max(awnings.length, 1)} castShadow receiveShadow geometry={awningGeometry}>
        <primitive object={materials.awning} attach="material" />
        {awnings.map((a, index) => <Instance key={`awning-${index}`} position={a.position} scale={a.scale} rotation={a.rotation} />)}
      </Instances>
      <Instances limit={Math.max(noren.length, 1)}>
        <planeGeometry args={[1, 1]} />
        <primitive object={materials.noren} attach="material" />
        {noren.map((c, index) => <Instance key={`noren-${index}`} position={c.position} scale={c.scale} rotation={c.rotation} />)}
      </Instances>
      <Instances limit={Math.max(lanterns.length, 1)}>
        <cylinderGeometry args={[0.16, 0.16, 0.36, 10]} />
        <primitive object={materials.lantern} attach="material" />
        {lanterns.map((pos, index) => <Instance key={`lantern-${index}`} position={pos} />)}
      </Instances>
      <Instances limit={Math.max(lanterns.length, 1)} castShadow>
        <coneGeometry args={[0.22, 0.18, 8]} />
        <primitive object={materials.lanternCap} attach="material" />
        {lanterns.map((pos, index) => <Instance key={`lantern-cap-${index}`} position={[pos[0], pos[1] + 0.27, pos[2]]} />)}
      </Instances>
    </group>
  );
});

export default function Buildings() {
'''

# Replace "export default function Buildings() {" (the second occurrence, after component) with component + new header
idx = t.rfind("export default function Buildings() {")
t = t[:idx] + component.lstrip() + t[idx+len("export default function Buildings() {"):]

# Replace tail from awningGeometry to end
tail_start = t.index("  const awningGeometry")
tail = '''  const awningGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(1, 0.07, 0.95);
    geometry.rotateX(0.38);
    geometry.translate(0, 0, 0.43);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  useEffect(
    () => () => {
      for (const texture of textures) {
        texture.dispose();
      }
    },
    [textures]
  );

  return (
    <group>
      {BANDS.map((band, i) => (
        <group key={band.id} ref={(g) => { bandRefs.current[i] = g; }}>
          <VillageInstances village={village} materials={materials} roofGeometry={roofGeometry} awningGeometry={awningGeometry} band={band} />
        </group>
      ))}
      {progressRef.current === 1 ? (
        <>
          <HokageTower materials={materials} />
          <Pagoda materials={materials} />
        </>
      ) : (
        <>
          <HokageTower materials={materials} />
          <Pagoda materials={materials} />
        </>
      )}
      <ToriiGate materials={materials} />
      <Lanterns />
    </group>
  );
}
'''
t = t[:tail_start] + tail
p.write_text(t)
print("patched ok", len(t))
