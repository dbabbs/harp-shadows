import {
   MapViewEventNames,
   MapView,
   ThemeLoader,
   InterpolatedClipPlanesEvaluator
} from "@here/harp-mapview";
import { MapControls } from "@here/harp-map-controls";
import { GeoCoordinates } from "@here/harp-geoutils";
import { OmvDataSource, APIFormat } from "@here/harp-omv-datasource";
import { shadowTheme, enableShadows } from "./shadows";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const theme = ThemeLoader.load("https://unpkg.com/@here/harp-map-theme@latest/resources/berlin_tilezen_day_reduced.json")

const map = new MapView({
   canvas: document.getElementById("map"),
   theme: shadowTheme(theme),
   maxVisibleDataSourceTiles: 40,
   tileCacheSize: 100,
   clipPlanesEvaluator: new InterpolatedClipPlanesEvaluator()
});
let azimuth = -140;
let distance = 5000; //8000; //2800;
const tilt = 55;
const coordinates = new GeoCoordinates(52.515174400779244, 13.403527166082263);

map.lookAt(coordinates, distance, tilt, azimuth);
map.renderLabels = false;

const mapControls = new MapControls(map);
mapControls.maxTiltAngle = 90;
map.resize(window.innerWidth, window.innerHeight);
window.onresize = () => map.resize(window.innerWidth, window.innerHeight);

const omvDataSource = new OmvDataSource({
   baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
   apiFormat: APIFormat.XYZOMV,
   styleSetName: "tilezen",
   authenticationCode: "ASCBZnCcvEMa-vbk9JXixN8"
});
map.addDataSource(omvDataSource);

const locations = [
   [13.402976989746094, 52.522279257582305],
   [13.408169746398924, 52.51893679887988],
   [13.410487174987793, 52.51238170797874],
   [13.398599624633789, 52.51499341517189]
];

(async () => {
   const windmill = await gltfLoader("windmill/scene.gltf");
   locations.forEach(w => {
      const location = new GeoCoordinates(w[1], w[0]);
      addWindmill(windmill, location);
   });
   enableShadows(map);
   startRotateMap();
})();

function addWindmill(scene, location) {
   const windmill = scene.scene.children[0].clone();
   windmill.scale.set(0.05, 0.05, 0.05);
   windmill.name = "animated-model";
   windmill.renderOrder = 10000;
   windmill.rotateX(Math.PI / 2);
   windmill.rotateZ((Math.PI / 2) * 2);
   windmill.position.set(-300, 100, 10);

   windmill.traverse(c => {
      c.renderOrder = 10000;
      if (c.material !== undefined) {
         c.material.transparent = true;
      }
      c.castShadow = true;
      c.receiveShadow = true;
   });
   windmill.geoPosition = location;
   map.mapAnchors.add(windmill);

   const clock = new THREE.Clock();
   const mixer = new THREE.AnimationMixer(windmill);

   const action = mixer.clipAction(scene.animations[0]);
   action.play();
   map.addEventListener(MapViewEventNames.Render, () => {
      if (mixer) {
         const delta = clock.getDelta();
         mixer.update(delta);
      }
   });
   map.beginAnimation();
}

function rotater() {
   azimuth += 0.01;
   distance -= 1;
   map.lookAt(coordinates, distance, tilt, azimuth);
}

function startRotateMap() {
   map.addEventListener(MapViewEventNames.Render, rotater);
}
function stopRotateMap() {
   map.removeEventListener(MapViewEventNames.Render, rotater);
}

function gltfLoader(path) {
   const loader = new GLTFLoader();
   return new Promise(resolve => {
      loader.load(path, obj => {
         resolve(obj);
      });
   });
}

map.canvas.onclick = event => {
   const intersectedObjects = map.intersectMapObjects(event.offsetX, event.offsetY);
   console.log(intersectedObjects);
}