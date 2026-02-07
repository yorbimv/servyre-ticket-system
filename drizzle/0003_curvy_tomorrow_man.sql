CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `tickets` ADD `folio` int NOT NULL;--> statement-breakpoint
ALTER TABLE `tickets` ADD `departmentId` int;--> statement-breakpoint
ALTER TABLE `tickets` ADD `userName` varchar(255);--> statement-breakpoint
ALTER TABLE `tickets` ADD `userEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_folio_unique` UNIQUE(`folio`);