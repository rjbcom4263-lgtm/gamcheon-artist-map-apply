import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { artistPoints, centerOf, distanceMeters, draftError } from "../app/map/geo.ts";

const data=JSON.parse(await readFile(new URL("../public/map-data/gamcheon.geojson",import.meta.url),"utf8"));
const buildings=data.features.filter(f=>f.properties.kind==="building");

test("all selected OSM buildings have unique stable IDs and closed real coordinate rings",()=>{
  assert.equal(buildings.length,1945);
  assert.equal(new Set(data.features.map(f=>f.id)).size,data.features.length);
  assert.equal(data.features.filter(f=>f.properties.highway==="steps").length,14);
  for(const b of buildings){
    assert.match(b.id,/^way\/\d+$/);
    assert.equal(b.geometry.type,"Polygon");
    const ring=b.geometry.coordinates[0];
    assert.ok(ring.length>=4);assert.deepEqual(ring[0],ring.at(-1));
    for(const [lng,lat] of ring){assert.ok(lng>128.9&&lng<129.1);assert.ok(lat>35&&lat<35.2);}
    if(b.properties.heightSource==="osm")assert.ok(b.properties.height>0);
    else assert.equal(b.properties.height,null,"Unmeasured buildings must not acquire a fabricated height");
  }
});

test("floor counts remain metadata and are not treated as measured building heights",()=>{
  const withFloors=buildings.filter(b=>b.properties.heightSource==="levels");
  assert.equal(withFloors.length,8);
  for(const b of withFloors){assert.ok(b.properties.levels>0);assert.equal(b.properties.height,null);}
});

test("artist drafts need a real building; entrances reject invalid or distant coordinates",()=>{
  const building=buildings[0];
  const draft={id:"test",buildingId:building.id,name:"검증 작가",studio:"검증 작업실",field:"회화",floor:"2층",note:"",entrance:null,status:"draft"};
  assert.equal(draftError(draft,building),"");
  assert.ok(draftError({...draft,name:" "},building));
  assert.ok(draftError({...draft,buildingId:"invented"},building));
  assert.ok(draftError({...draft,entrance:[NaN,35]},building));
  assert.ok(draftError({...draft,entrance:[129,36]},building));
  assert.equal(draftError({...draft,entrance:centerOf(building)},building),"");
  assert.equal(distanceMeters([129,35],[129,35]),0);
  assert.ok(Math.abs(distanceMeters([129,35],[129,35.001])-111.195)<.1);
});

test("no fictional artist pins appear and several artists in one building share one group",()=>{
  assert.deepEqual(artistPoints([],buildings).features,[]);
  const id=buildings[0].id;
  const pins=artistPoints([{id:"1",buildingId:id,name:"A"},{id:"2",buildingId:id,name:"B"},{id:"3",buildingId:"invalid",name:"C"}],buildings);
  assert.equal(pins.features.length,1);assert.equal(pins.features[0].properties.count,2);
  assert.equal(pins.features[0].properties.buildingId,id);
  assert.match(pins.features[0].properties.label,/초안/);
});
