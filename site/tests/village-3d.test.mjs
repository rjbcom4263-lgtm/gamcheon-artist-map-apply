import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import * as THREE from "three";

// Resolve the same extensionless local TS imports that Vite resolves in the app.
registerHooks({resolve(specifier,context,next){try{return next(specifier,context);}catch(error){if(specifier.startsWith("./")&&!/\.[a-z]+$/i.test(specifier))return next(`${specifier}.ts`,context);throw error;}}});
const {AREA,FIRST_AREA,WIDTH,DEPTH,scopeData,inArea,toLocal,toGps,clipSegment,appearanceFor,validAppearance}=await import("../app/map/village.ts");
const {buildingModel,terrainModel,roadModel,disposeObject,overviewFrame}=await import("../app/map/village-scene.ts");
const original=JSON.parse(await readFile(new URL("../public/map-data/gamcheon.geojson",import.meta.url),"utf8"));
const scoped=scopeData(original),buildings=scoped.features.filter(f=>f.properties.kind==="building");

test("scope preserves source building footprints and only clips existing road segments",()=>{
  assert.ok(buildings.length>1400&&buildings.length<1800);
  const previous=original.features.filter(f=>f.properties.kind==="building"&&f.geometry.coordinates[0].some(p=>p[0]>=FIRST_AREA.west&&p[0]<=FIRST_AREA.east&&p[1]>=FIRST_AREA.south&&p[1]<=FIRST_AREA.north));
  assert.equal(previous.length,487);
  for(const f of previous)assert.ok(buildings.some(b=>b.id===f.id),`Existing building ${f.id} must survive expansion`);
  assert.ok(scoped.features.some(f=>f.id==="node/10679830337"),"Little Prince landmark is included");
  assert.equal(new Set(scoped.features.map(f=>f.id)).size,scoped.features.length);
  for(const b of buildings){const source=original.features.find(f=>f.id===b.id);assert.deepEqual(b,source);assert.equal(b.properties.height,null);}
  for(const f of scoped.features.filter(f=>f.properties.kind==="road"))for(const p of f.geometry.coordinates)assert.ok(p[0]>=AREA.west-1e-10&&p[0]<=AREA.east+1e-10&&p[1]>=AREA.south-1e-10&&p[1]<=AREA.north+1e-10);
  assert.equal(clipSegment([0,0],[1,1]),null);
  const crossing=clipSegment([AREA.west-.01,AREA.south+.001],[AREA.east+.01,AREA.south+.001]);assert.ok(crossing);assert.ok(Math.abs(crossing[0][0]-AREA.west)<1e-10);
  assert.equal(inArea([129,35]),false);
  const p=[129.0094,35.095];const roundTrip=toGps(...toLocal(p));assert.ok(Math.hypot(roundTrip[0]-p[0],roundTrip[1]-p[1])<1e-12);
});

test("expanded village fits landscape and portrait cameras in both overview modes",()=>{
  const box=new THREE.Box3(new THREE.Vector3(-WIDTH/2,-1,-DEPTH/2),new THREE.Vector3(WIDTH/2,180,DEPTH/2));
  for(const aspect of [.45,.65,1,1.8,2.5])for(const top of [false,true]) {
    const frame=overviewFrame(box,aspect,35,top);const camera=new THREE.PerspectiveCamera(35,aspect,1,10000);
    camera.position.copy(frame.position);camera.lookAt(frame.target);camera.updateMatrixWorld(true);
    for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]) {
      const projected=new THREE.Vector3(x,y,z).project(camera);
      assert.ok(Math.abs(projected.x)<1&&Math.abs(projected.y)<1&&projected.z<1&&projected.z> -1,`Corner outside viewport, aspect=${aspect}, top=${top}`);
    }
  }
});

test("all real footprints produce finite selectable 3D geometry; edits change model height only",()=>{
  for(const f of buildings) {
    const appearance=appearanceFor(f),model=buildingModel(f,appearance,()=>10);
    assert.ok(validAppearance(appearance),`Source-derived height must be editable: ${f.id}`);
    assert.equal(model.name,f.id);model.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(model);assert.ok(!box.isEmpty());assert.ok(Math.abs(box.max.y-(10+appearance.height+.22))<.001);
    model.traverse(o=>{if(o.geometry)for(const number of o.geometry.attributes.position.array)assert.ok(Number.isFinite(number));});
    const roof=model.getObjectByName("roof");const center=new THREE.Box3().setFromObject(roof).getCenter(new THREE.Vector3());
    assert.equal(roof.userData.buildingId,f.id);assert.ok(Number.isFinite(center.y));disposeObject(model);
  }
  const f=buildings[0],appearance={...appearanceFor(f),height:12,windows:true};const model=buildingModel(f,appearance,()=>0);model.updateMatrixWorld(true);
  assert.ok(Math.abs(new THREE.Box3().setFromObject(model).max.y-12.22)<.001);assert.equal(f.properties.height,null);disposeObject(model);
  assert.ok(validAppearance(appearance));assert.equal(validAppearance({...appearance,height:NaN}),false);assert.equal(validAppearance({...appearance,roof:"red<script>"}),false);
});

test("terrain covers the target bounds and clipped road meshes contain finite vertices",()=>{
  const elevation=(x,z)=>20+x*.1+z*.02;
  const terrain=terrainModel(elevation);terrain.geometry.computeBoundingBox();assert.ok(Math.abs(terrain.geometry.boundingBox.max.x-WIDTH/2)<.001);assert.ok(Math.abs(terrain.geometry.boundingBox.max.z-DEPTH/2)<.001);
  const ray=new THREE.Raycaster(new THREE.Vector3(0,300,0),new THREE.Vector3(0,-1,0));terrain.updateMatrixWorld(true);const hit=ray.intersectObject(terrain)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-20)<.01);
  const roads=roadModel(scoped.features.filter(f=>f.properties.kind==="road"),elevation);assert.ok(roads.children.length>0);roads.traverse(o=>{if(o.geometry)for(const number of o.geometry.attributes.position.array)assert.ok(Number.isFinite(number));});disposeObject(terrain);disposeObject(roads);
});
