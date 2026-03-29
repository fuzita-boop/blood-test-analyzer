CREATE TABLE `assessment_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bloodTestRecordId` int NOT NULL,
	`userId` int NOT NULL,
	`patientId` int,
	`abnormalValues` json,
	`predictedConditions` json,
	`observationPoints` json,
	`recordSummary` text,
	`fullReportText` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blood_test_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`patientId` int,
	`imageUrl` text NOT NULL,
	`imageKey` varchar(500) NOT NULL,
	`testDate` timestamp,
	`extractedData` json,
	`status` enum('uploading','processing','completed','error') NOT NULL DEFAULT 'uploading',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blood_test_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`patientCode` varchar(50),
	`birthYear` int,
	`gender` enum('male','female','other'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
