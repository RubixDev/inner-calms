import * as z from 'zod'
import { ShipLogFactKey } from './ship-log.model'
import { ConditionKey } from './persistent-conditions.model'

export enum SignalName {
  Default = 0,
  Traveler_Esker = 10,
  Traveler_Chert = 11,
  Traveler_Riebeck = 12,
  Traveler_Gabbro = 13,
  Traveler_Feldspar = 14,
  Traveler_Nomai = 15,
  Traveler_Prisoner = 16,
  Quantum_CT_Shard = 20,
  Quantum_TH_MuseumShard = 21,
  Quantum_TH_GroveShard = 22,
  Quantum_BH_Shard = 23,
  Quantum_GD_Shard = 24,
  Quantum_QM = 25,
  EscapePod_CT = 30,
  EscapePod_BH = 31,
  EscapePod_DB = 32,
  WhiteHole_WH = 40,
  WhiteHole_SS_Receiver = 41,
  WhiteHole_CT_Receiver = 42,
  WhiteHole_CT_Experiment = 43,
  WhiteHole_TT_Receiver = 44,
  WhiteHole_TT_TimeLoopCore = 45,
  WhiteHole_TH_Receiver = 46,
  WhiteHole_BH_NorthPoleReceiver = 47,
  WhiteHole_BH_ForgeReceiver = 48,
  WhiteHole_GD_Receiver = 49,
  HideAndSeek_Galena = 60,
  HideAndSeek_Tephra = 61,
  HideAndSeek_Arkose = 62,
  RadioTower = 100,
  MapSatellite = 101,
}

export enum DeathType {
  Default = 0,
  Impact = 1,
  Asphyxiation = 2,
  Energy = 3,
  Supernova = 4,
  Digestion = 5,
  BigBang = 6,
  Crushed = 7,
  Meditation = 8,
  TimeLoop = 9,
  Lava = 10,
  BlackHole = 11,
  Dream = 12,
  DreamExplosion = 13,
  CrushedByElevator = 14,
}

export enum StartupPopups {
  None = 0,
  ResetInputs = 1 << 0,
  ReducedFrights = 2 << 1,
  NewExhibit = 4 << 2,
}

export const ShipLogFactSave = z.object({
  id: ShipLogFactKey,
  // -1 means not revealed
  revealOrder: z.int(),
  read: z.boolean(),
  newlyRevealed: z.boolean(),
})
export type ShipLogFactSave = z.infer<typeof ShipLogFactSave>

export const SaveFile = z.object({
  loopCount: z.int(),
  knownFrequencies: z.array(z.boolean()).min(7),
  knownSignals: z.record(z.int(), z.boolean()),
  dictConditions: z.record(ConditionKey, z.boolean()),
  shipLogFactSaves: z.record(ShipLogFactKey, ShipLogFactSave),
  newlyRevealedFactIDs: z.array(z.string()),
  lastDeathType: z.enum(DeathType),
  burnedMarshmallowEaten: z.int().default(0),
  fullTimeloops: z.int().nonnegative().default(0),
  perfectMarshmallowsEaten: z.int().nonnegative().default(0),
  warpedToTheEye: z.boolean().default(false),
  secondsRemainingOnWarp: z.number().default(0.0),
  loopCountOnParadox: z.int().default(0),
  shownPopups: z.int().default(StartupPopups.None), // TODO: flags with StartupPopups
  version: z.string().default('NONE'),
  ps5Activity_canResumeExpedition: z.boolean().default(false),
  ps5Activity_availableShipLogCards: z.array(z.string()).default([]),
  // TODO: previously `runInitGammaSetting`
  didRunInitGammaSetting: z.boolean().default(true),
})
export type SaveFile = z.infer<typeof SaveFile>

// see https://zod.dev/codecs?id=jsonschema
const jsonCodec = <T extends z.core.$ZodType>(schema: T) =>
  z.codec(z.string(), schema, {
    decode: (jsonString, ctx) => {
      try {
        return JSON.parse(jsonString)
      } catch (err: any) {
        ctx.issues.push({
          code: 'invalid_format',
          format: 'json',
          input: jsonString,
          message: err.message,
        })
        return z.NEVER
      }
    },
    encode: value => JSON.stringify(value),
  })

export const SaveFileJson = jsonCodec(SaveFile)
