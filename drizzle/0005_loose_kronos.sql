ALTER TABLE `ticket_comments` MODIFY COLUMN `content` text;--> statement-breakpoint
ALTER TABLE `ticket_comments` ADD `attachmentUrl` text;--> statement-breakpoint
ALTER TABLE `ticket_comments` ADD `attachmentName` varchar(255);