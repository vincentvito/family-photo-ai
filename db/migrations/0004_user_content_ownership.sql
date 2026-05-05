truncate table
  "familyphotoai"."credit_usages",
  "familyphotoai"."album_images",
  "familyphotoai"."refinement_history",
  "familyphotoai"."images",
  "familyphotoai"."photos",
  "familyphotoai"."albums",
  "familyphotoai"."generations",
  "familyphotoai"."people"
cascade;

alter table "familyphotoai"."people"
  add column if not exists "user_id" text not null;

alter table "familyphotoai"."generations"
  add column if not exists "user_id" text not null;

alter table "familyphotoai"."albums"
  add column if not exists "user_id" text not null;

create index if not exists "people_user_id_idx"
  on "familyphotoai"."people" ("user_id");

create index if not exists "generations_user_id_idx"
  on "familyphotoai"."generations" ("user_id");

create index if not exists "albums_user_id_idx"
  on "familyphotoai"."albums" ("user_id");
