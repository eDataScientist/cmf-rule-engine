export interface ClaimData {
  'Claim Number'?: string;
  'Claim number'?: string;
  count_of_parts?: number;
  damage_left?: number | boolean;
  damage_rear?: number | boolean;
  damage_right?: number | boolean;
  Make_Continent_North_America?: number | boolean;
  Estimated_Amount?: number;
  approved_claim_amount?: number;
  loss_days_from_policy?: number;
  claim_ratio?: number;
  intm_days_till_expiry?: number;
  days_from_loss_intm?: number;
  age_of_car?: number;
  vehicle_age?: number;
  involved_parties?: number;
  value_class_ordinal?: number;
  days_between_intm_loss?: number;
  veh_brand_TOYOTA?: number | boolean;
  veh_brand_HYUNDAI?: number | boolean;
  veh_brand_KIA?: number | boolean;
  veh_brand_Other?: number | boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface NormalizedClaim {
  [key: string]: string | number;
}

export function normalizeClaim(claim: ClaimData): NormalizedClaim {
  const normalized: NormalizedClaim = {};

  for (const [key, value] of Object.entries(claim)) {
    if (value === undefined || value === null) continue;

    if (typeof value === 'boolean') {
      normalized[key] = value ? 1 : 0;
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}
