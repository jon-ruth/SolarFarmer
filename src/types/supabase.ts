export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          address: string;
          town_name: string;
          solar_balance: string;
          eth_rewards: string;
          created_at: string;
          last_claim_at: string;
          streak_days: number;
          streak_last_claim_date: string;
          total_earned: string;
          referral_code: string | null;
          referred_by: string | null;
        };
        Insert: {
          address: string;
          town_name: string;
          solar_balance?: string;
          eth_rewards?: string;
          created_at?: string;
          last_claim_at?: string;
          streak_days?: number;
          streak_last_claim_date?: string;
          total_earned?: string;
          referral_code?: string | null;
          referred_by?: string | null;
        };
        Update: {
          address?: string;
          town_name?: string;
          solar_balance?: string;
          eth_rewards?: string;
          created_at?: string;
          last_claim_at?: string;
          streak_days?: number;
          streak_last_claim_date?: string;
          total_earned?: string;
          referral_code?: string | null;
          referred_by?: string | null;
        };
      };
      towns: {
        Row: {
          id: string;
          player_address: string;
          name: string;
          total_power_capacity: number;
          total_power_demand: number;
          development_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_address: string;
          name: string;
          total_power_capacity?: number;
          total_power_demand?: number;
          development_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_address?: string;
          name?: string;
          total_power_capacity?: number;
          total_power_demand?: number;
          development_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      solar_panels: {
        Row: {
          id: string;
          town_id: string;
          type: string;
          level: number;
          power_output: number;
          is_constructing: boolean;
          construction_started_at: string | null;
          construction_ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          town_id: string;
          type: string;
          level?: number;
          power_output?: number;
          is_constructing?: boolean;
          construction_started_at?: string | null;
          construction_ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          town_id?: string;
          type?: string;
          level?: number;
          power_output?: number;
          is_constructing?: boolean;
          construction_started_at?: string | null;
          construction_ends_at?: string | null;
          created_at?: string;
        };
      };
      batteries: {
        Row: {
          id: string;
          town_id: string;
          level: number;
          capacity: number;
          current_charge: number;
          is_constructing: boolean;
          construction_ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          town_id: string;
          level?: number;
          capacity?: number;
          current_charge?: number;
          is_constructing?: boolean;
          construction_ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          town_id?: string;
          level?: number;
          capacity?: number;
          current_charge?: number;
          is_constructing?: boolean;
          construction_ends_at?: string | null;
          created_at?: string;
        };
      };
      buildings: {
        Row: {
          id: string;
          town_id: string;
          type: string;
          level: number;
          power_required: number;
          is_powered: boolean;
          reward_multiplier: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          town_id: string;
          type: string;
          level?: number;
          power_required?: number;
          is_powered?: boolean;
          reward_multiplier?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          town_id?: string;
          type?: string;
          level?: number;
          power_required?: number;
          is_powered?: boolean;
          reward_multiplier?: number;
          created_at?: string;
        };
      };
      workers: {
        Row: {
          id: string;
          town_id: string;
          level: number;
          speed_multiplier: number;
          is_working: boolean;
          current_task_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          town_id: string;
          level?: number;
          speed_multiplier?: number;
          is_working?: boolean;
          current_task_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          town_id?: string;
          level?: number;
          speed_multiplier?: number;
          is_working?: boolean;
          current_task_id?: string | null;
          created_at?: string;
        };
      };
      epoch_rewards: {
        Row: {
          id: string;
          epoch_date: string;
          total_fees_collected: string;
          total_distributed: string;
          distribution_tx_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          epoch_date: string;
          total_fees_collected?: string;
          total_distributed?: string;
          distribution_tx_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          epoch_date?: string;
          total_fees_collected?: string;
          total_distributed?: string;
          distribution_tx_hash?: string | null;
          created_at?: string;
        };
      };
      player_epoch_rewards: {
        Row: {
          id: string;
          player_address: string;
          epoch_id: string;
          development_score_snapshot: number;
          reward_amount: string;
          claimed: boolean;
          claimed_at: string | null;
        };
        Insert: {
          id?: string;
          player_address: string;
          epoch_id: string;
          development_score_snapshot: number;
          reward_amount?: string;
          claimed?: boolean;
          claimed_at?: string | null;
        };
        Update: {
          id?: string;
          player_address?: string;
          epoch_id?: string;
          development_score_snapshot?: number;
          reward_amount?: string;
          claimed?: boolean;
          claimed_at?: string | null;
        };
      };
    };
    Views: {
      leaderboard: {
        Row: {
          address: string;
          town_name: string;
          development_score: number;
          total_power_capacity: number;
          streak_days: number;
          rank: number;
        };
      };
    };
    Functions: {
      get_leaderboard: {
        Args: { limit_count: number };
        Returns: {
          address: string;
          town_name: string;
          development_score: number;
          total_power_capacity: number;
          streak_days: number;
          rank: number;
        }[];
      };
      update_player_streak: {
        Args: { player_address: string };
        Returns: {
          streak_days: number;
          streak_last_claim_date: string;
        };
      };
    };
  };
}
