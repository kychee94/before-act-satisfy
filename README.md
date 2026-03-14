# Q1
Run command "docker compose exec app php artisan migrate to migrate all relavent tables into database.
Run command "docker compose exec app php artisan db:seed --class=Q1Seeder" to seed data into database.

# Q2
SQL query generated:
select `announcement`.`uuid` as `uuid`, `announcement`.`title` as `title`, `announcement`.`content` as `content`, `customer_announcement`.`is_read` as `read`, `customer_announcement`.`created_at` as `inserted_date` from `customer_announcement` inner join `announcement` on `announcement`.`id` = `customer_announcement`.`announcement_id` where `customer_id` = ? and `is_read` = ? and `customer_announcement`.`status` = ? and `customer_announcement`.`deleted_at` is null order by `customer_announcement`.`created_at` desc limit 20 offset 0

# Q3
Run command "docker compose exec app php artisan read:announcement" and input the prompt values respectively

AI assist:
- Setting up projects in docker environment. 
- Troubleshoot errors.

Keynotes:
- Project layout(Q2) is done using Vuexy template from themeforest.
- Techstack used: Laravel 12 + InertiaJS.
- Total timespent:
	- Q4 Setting up environment (4 hours)
	- Q1 (10 minutes)
	- Q2 (2 hours)
	- Q3 (10 minutes)

Credentials:
- mysql database
	- username: announcekit
	- password: secret
- customer login (Q2)
	- username: customera
	- password: 123456