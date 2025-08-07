import { AdapterParams } from '@/adapter/types'
import { IReferralWithStats } from '@/domain/entity/referral'

type Params = Pick<AdapterParams, 'db'>

export type ListWithStats = (data: { userId: string }) => Promise<Array<IReferralWithStats> | never>

export const buildListWithStats = ({ db }: Params): ListWithStats => {
  return async (data) => {
    const referrals = await db.client.$queryRaw<Array<IReferralWithStats>>`
      WITH 
        referrals AS (
          SELECT 
            r.*,
            COUNT(rp.id) as participants_count
          FROM "Referral" r
          LEFT JOIN "ReferralParticipant" rp ON r.id = rp.referral_id
          WHERE 
            r.owner_id = ${data.userId}
            AND r.disabled = false
          GROUP BY r.id
        ),
        transaction_stats AS (
          SELECT 
            r.id as referral_id,
            SUM(
              CASE 
                WHEN t.currency = 'RUB' THEN t.amount
                WHEN t.currency IS NOT NULL THEN t.amount * 100
                ELSE 0
              END
            ) as amount_spend_by_users,
            COUNT(DISTINCT t.user_id) as paid_participants_count
          FROM "Referral" r
          JOIN "ReferralParticipant" rp ON r.id = rp.referral_id
          JOIN transactions t ON t.user_id = rp.user_id
          WHERE 
            r.owner_id = ${data.userId}
            AND r.disabled = false
            AND t.currency != 'BOTHUB_TOKEN'
            AND t.deleted = false
            AND t.status = 'SUCCEDED'
          GROUP BY r.id
        )
      SELECT 
        referrals.*,
        COALESCE(ts.amount_spend_by_users, 0) as amount_spend_by_users,
        COALESCE(ts.paid_participants_count, 0) as paid_participants_count,
        to_jsonb(tmpl.*) || jsonb_build_object(
          'plan', to_jsonb(plans.*)
        ) as template
      FROM referrals
      LEFT JOIN transaction_stats ts ON referrals.id = ts.referral_id
      LEFT JOIN "ReferralTemplate" tmpl ON referrals.template_id = tmpl.id
      LEFT JOIN plans ON tmpl.plan_id = plans.id
    `

    return referrals.map((referral) => ({
      ...referral,
      amount_spend_by_users: Number(referral.amount_spend_by_users),
      participants_count: Number(referral.participants_count),
      paid_participants_count: Number(referral.paid_participants_count),
    }))
  }
}
