// Hand-written to match supabase/migrations/0001_init.sql. Once you have a
// live Supabase project, regenerate the real thing with:
//   npx supabase gen types typescript --project-id <your-project-id> > src/lib/supabase/types.ts
// and this file's shape should end up identical (or very close) to what's here.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; avatar_url: string | null; created_at: string };
        Insert: { id: string; display_name: string; avatar_url?: string | null };
        Update: { display_name?: string; avatar_url?: string | null };
      };
      families: {
        Row: { id: string; name: string; created_by: string; created_at: string };
        Insert: { id?: string; name: string; created_by: string };
        Update: { name?: string };
      };
      family_members: {
        Row: { family_id: string; user_id: string; role: "owner" | "member"; joined_at: string };
        Insert: { family_id: string; user_id: string; role?: "owner" | "member" };
        Update: { role?: "owner" | "member" };
      };
      categories: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          icon: string | null;
          color: string | null;
          kind: "income" | "expense";
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          kind: "income" | "expense";
        };
        Update: { name?: string; icon?: string | null; color?: string | null };
      };
      cards: {
        Row: {
          id: string;
          owner_id: string;
          family_id: string;
          name: string;
          card_type: "credito" | "debito";
          last4: string | null;
          color: string | null;
          cut_off_day: number | null;
          payment_due_day: number | null;
          credit_limit: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          family_id: string;
          name: string;
          card_type: "credito" | "debito";
          last4?: string | null;
          color?: string | null;
          cut_off_day?: number | null;
          payment_due_day?: number | null;
          credit_limit?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["cards"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          owner_id: string;
          family_id: string;
          category_id: string | null;
          card_id: string | null;
          amount: number;
          kind: "income" | "expense";
          payment_method: "efectivo" | "tarjeta";
          description: string | null;
          is_shared: boolean;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          family_id: string;
          category_id?: string | null;
          card_id?: string | null;
          amount: number;
          kind: "income" | "expense";
          payment_method?: "efectivo" | "tarjeta";
          description?: string | null;
          is_shared?: boolean;
          occurred_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      savings_goals: {
        Row: {
          id: string;
          owner_id: string;
          family_id: string;
          name: string;
          target_amount: number | null;
          target_date: string | null;
          is_shared: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          family_id: string;
          name: string;
          target_amount?: number | null;
          target_date?: string | null;
          is_shared?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["savings_goals"]["Insert"]>;
      };
      savings_contributions: {
        Row: { id: string; goal_id: string; amount: number; occurred_at: string; note: string | null; created_at: string };
        Insert: { id?: string; goal_id: string; amount: number; occurred_at?: string; note?: string | null };
        Update: Partial<Database["public"]["Tables"]["savings_contributions"]["Insert"]>;
      };
    };
    Functions: {
      get_household_category_totals: {
        Args: { fam_id: string; from_date: string; to_date: string };
        Returns: { category_id: string; category_name: string; kind: "income" | "expense"; total: number }[];
      };
      is_family_member: {
        Args: { fam_id: string };
        Returns: boolean;
      };
    };
  };
}
