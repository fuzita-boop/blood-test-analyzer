DROP TABLE `patients`;--> statement-breakpoint
ALTER TABLE `assessment_reports` DROP COLUMN `patientId`;--> statement-breakpoint
ALTER TABLE `blood_test_records` DROP COLUMN `patientId`;--> statement-breakpoint
ALTER TABLE `blood_test_records` DROP COLUMN `imageUrl`;--> statement-breakpoint
ALTER TABLE `blood_test_records` DROP COLUMN `imageKey`;