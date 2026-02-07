ALTER TABLE `tickets` MODIFY COLUMN `folio` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `tickets` ADD `branch` varchar(10) DEFAULT 'SRV' NOT NULL;