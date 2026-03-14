# Q1
Run command "docker compose exec app php artisan migrate to migrate all relavent tables into database.
Run command "docker compose exec app php artisan db:seed --class=Q1Seeder" to seed data into database.

# Q2
SQL query generated:
select `announcement`.`uuid` as `uuid`, `announcement`.`title` as `title`, `announcement`.`content` as `content`, `customer_announcement`.`is_read` as `read`, `customer_announcement`.`created_at` as `inserted_date` from `customer_announcement` inner join `announcement` on `announcement`.`id` = `customer_announcement`.`announcement_id` where `customer_id` = ? and `is_read` = ? and `customer_announcement`.`status` = ? and `customer_announcement`.`deleted_at` is null order by `customer_announcement`.`created_at` desc limit 20 offset 0

# Q3
Run command "docker compose exec app php artisan read:announcement" and input the prompt values respectively