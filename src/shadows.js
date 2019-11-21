import { ThemeLoader } from "@here/harp-mapview";
import { isJsonExpr } from "@here/harp-datasource-protocol/lib/Expr";
import { PCFSoftShadowMap } from "three";
import { ShadowMapViewer } from "three/examples/jsm/utils/ShadowMapViewer";
import { MapViewEventNames } from "@here/harp-mapview";

const options = {
   top: 5000,
   left: -5000,
   right: 5000,
   bottom: -5000,
   far: 10000,
   near: 0
};

let move = false;
setTimeout(() => {
   move = true;
}, 8000);

function enableShadows(map) {
   map.renderer.shadowMap.enabled = true;
   map.renderer.shadowMap.type = PCFSoftShadowMap;

   const updateLightCamera = () => {
      map.scene.children.forEach(light => {
         if (light.isDirectionalLight) {
            light.shadow.bias = 0.001;
            light.shadow.mapSize.width = 4096;
            light.shadow.mapSize.height = 4096;
            Object.assign(light.shadow.camera, options);
            light.shadow.camera.updateProjectionMatrix();
         }
      });
      let first = true;
      let y = 0;
      let x = 1;
      const eventListener = () => {
         const enableCastAndReceive = obj => {
            if (obj.isMesh) {
               obj.castShadow = true;
               obj.receiveShadow = true;
            }
            obj.children.forEach(enableCastAndReceive);
            if (obj.isDirectionalLight) {
               if (first) {
                  console.log(obj);
                  first = false;
               }
               if (move) {
                  if (y < 1) {
                     y += 0.003;
                  } else if (y >= 1 && x > 0) {
                     x -= 0.003;
                  }
               }
               if (y !== 1 && x !== 0) {
                  obj.position.set(x, y, 1);
               }
            }
         };
         map.scene.children.forEach(enableCastAndReceive);
      };
      map.addEventListener(MapViewEventNames.Render, eventListener);
      map.clearTileCache();
      map.update();
   };
   updateLightCamera();
}

async function shadowTheme(sourceTheme) {
   const direction = { x: 1, y: 1, z: 1 };
   const theme = await ThemeLoader.load(sourceTheme);
   theme.lights = [
      {
         type: "ambient",
         color: "#ffffff",
         name: "ambientLight",
         intensity: 0.9
      },
      {
         type: "directional",
         color: "#ffffff",
         name: "light1",
         intensity: 1.0,
         direction,
         castShadow: true
      }
   ];
   if (theme.styles === undefined || theme.styles.tilezen === undefined) {
      throw Error("Theme has no tilezen styles");
   }
   if (theme.definitions !== undefined) {
      for (const definitionName in theme.definitions) {
         if (!theme.definitions.hasOwnProperty(definitionName)) {
            continue;
         }
         const definition = theme.definitions[definitionName];
         if (!isValueDefinition(definition)) {
            const styleDeclaration = definition;
            patchFillStyle(styleDeclaration);
         }
      }
   }
   theme.styles.tilezen.push({
      description: "builtup area",
      when: "$layer ^= 'landuse' && (($geometryType ^= 'polygon') && kind in ['urban_area'])",
      technique: "fill",
      attr: {
         color: "#D4CDC0"
      },
      renderOrder: 0
   });
   theme.styles.tilezen.forEach(styleDeclaration => {
      patchFillStyle(styleDeclaration);
   });
   return theme;
}

function patchFillStyle(styleDeclaration) {
   if (!isJsonExpr(styleDeclaration)) {
      const style = styleDeclaration;
      if (style.technique === "fill") {
         style.technique = "standard";
         style.attr.roughness = 8.0;
         style.attr.opacity = 1;
      }
      // if (style.description === 'builtup area') {
      //    style.technique = "standard";
      //    style.attr.color = '#EDF8FB'
      // }
   }
}

export { enableShadows, shadowTheme };
