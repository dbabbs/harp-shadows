// FIXME: THREE as external is not working somehow
// self.importScripts("three.min.js");

import { OmvTileDecoderService, OmvTilerService } from "@here/harp-omv-datasource/index-worker";

OmvTileDecoderService.start();
OmvTilerService.start();
