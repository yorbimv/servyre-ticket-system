CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`uploadedByUserId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`color` varchar(7) NOT NULL DEFAULT '#3B82F6',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`ticketId` int,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('ticket_created','ticket_assigned','ticket_status_changed','comment_added','attachment_added','ticket_resolved','general') NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`actionUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priorities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`displayName` varchar(50) NOT NULL,
	`level` int NOT NULL,
	`color` varchar(7) NOT NULL DEFAULT '#6B7280',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priorities_id` PRIMARY KEY(`id`),
	CONSTRAINT `priorities_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `ticket_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`isInternal` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ticket_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`changedByUserId` int NOT NULL,
	`fieldName` varchar(100) NOT NULL,
	`oldValue` text,
	`newValue` text,
	`changeType` enum('created','status_changed','assigned','priority_changed','category_changed','comment_added','attachment_added','other') NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_statuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`displayName` varchar(50) NOT NULL,
	`description` text,
	`color` varchar(7) NOT NULL DEFAULT '#6B7280',
	`order` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_statuses_id` PRIMARY KEY(`id`),
	CONSTRAINT `ticket_statuses_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketNumber` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`categoryId` int NOT NULL,
	`statusId` int NOT NULL,
	`priorityId` int NOT NULL,
	`createdByUserId` int NOT NULL,
	`assignedToUserId` int,
	`technicalReport` text,
	`resolutionNotes` text,
	`estimatedResolutionTime` varchar(100),
	`actualResolutionTime` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolvedAt` timestamp,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`),
	CONSTRAINT `tickets_ticketNumber_unique` UNIQUE(`ticketNumber`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','technician','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `department` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `activity_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `activity_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ticketId_idx` ON `attachments` (`ticketId`);--> statement-breakpoint
CREATE INDEX `uploadedBy_idx` ON `attachments` (`uploadedByUserId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `ticketId_idx` ON `notifications` (`ticketId`);--> statement-breakpoint
CREATE INDEX `isRead_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `ticketId_idx` ON `ticket_comments` (`ticketId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `ticket_comments` (`userId`);--> statement-breakpoint
CREATE INDEX `ticketId_idx` ON `ticket_history` (`ticketId`);--> statement-breakpoint
CREATE INDEX `changedBy_idx` ON `ticket_history` (`changedByUserId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `ticket_history` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ticketNumber_idx` ON `tickets` (`ticketNumber`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `tickets` (`statusId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `tickets` (`categoryId`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `tickets` (`priorityId`);--> statement-breakpoint
CREATE INDEX `createdBy_idx` ON `tickets` (`createdByUserId`);--> statement-breakpoint
CREATE INDEX `assignedTo_idx` ON `tickets` (`assignedToUserId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `tickets` (`createdAt`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);