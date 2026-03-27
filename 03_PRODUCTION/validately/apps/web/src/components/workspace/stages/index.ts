import { DiagnoseStage } from "./DiagnoseStage";
import { DiscoverStage } from "./DiscoverStage";
import { DefineStage } from "./DefineStage";
import { ValidateStage } from "./ValidateStage";
import { IgniteStage } from "./IgniteStage";
import { DeployStage } from "./DeployStage";
import { DominateStage } from "./DominateStage";

export const STAGE_COMPONENTS = [
  DiagnoseStage,
  DiscoverStage,
  DefineStage,
  ValidateStage,
  IgniteStage,
  DeployStage,
  DominateStage,
] as const;
