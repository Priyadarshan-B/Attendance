-- Adminer 4.8.1 MySQL 8.3.0 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `attendance`;
CREATE DATABASE `attendance` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `attendance`;

DROP TABLE IF EXISTS `arrear_attendence`;
CREATE TABLE `arrear_attendence` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `date` date NOT NULL,
  `time_range` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student` bigint NOT NULL,
  `date` date NOT NULL,
  `forenoon` enum('0','1') NOT NULL DEFAULT '0' COMMENT '0-absent 1- present',
  `afternoon` enum('0','1') NOT NULL DEFAULT '0' COMMENT '0-absent 1-present',
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `student` (`student`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `holidays`;
CREATE TABLE `holidays` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dates` date NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `holidays` (`id`, `dates`, `status`) VALUES
(1,	'2024-08-15',	'1'),
(2,	'2024-10-02',	'1');

DROP TABLE IF EXISTS `leave`;
CREATE TABLE `leave` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student` bigint NOT NULL,
  `leave` bigint NOT NULL,
  `from_date` date NOT NULL,
  `from_time` time NOT NULL,
  `to_date` date NOT NULL,
  `to_time` time NOT NULL,
  `status` enum('0','1','2','3') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '2',
  PRIMARY KEY (`id`),
  KEY `student` (`student`),
  KEY `leave` (`leave`),
  CONSTRAINT `leave_ibfk_1` FOREIGN KEY (`student`) REFERENCES `students` (`id`),
  CONSTRAINT `leave_ibfk_2` FOREIGN KEY (`leave`) REFERENCES `leave_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `leave_type`;
CREATE TABLE `leave_type` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `mentor`;
CREATE TABLE `mentor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `gmail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role_id` bigint NOT NULL DEFAULT '1',
  `status` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `mentor_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `mentor_student`;
CREATE TABLE `mentor_student` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mentor` bigint NOT NULL,
  `student` bigint NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `mentor` (`mentor`),
  KEY `student` (`student`),
  CONSTRAINT `mentor_student_ibfk_1` FOREIGN KEY (`mentor`) REFERENCES `mentor` (`id`),
  CONSTRAINT `mentor_student_ibfk_2` FOREIGN KEY (`student`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `no_arrear`;
CREATE TABLE `no_arrear` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student` varchar(255) NOT NULL,
  `attendence` timestamp NULL DEFAULT NULL,
  `place` varchar(255) DEFAULT NULL,
  `status` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `student` (`student`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `re_appear`;
CREATE TABLE `re_appear` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `faculty` bigint NOT NULL,
  `student` bigint NOT NULL,
  `slot` int NOT NULL,
  `att_session` timestamp NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `student` (`student`),
  KEY `faculty` (`faculty`),
  KEY `att_session` (`att_session`),
  KEY `slot` (`slot`),
  CONSTRAINT `re_appear_ibfk_1` FOREIGN KEY (`student`) REFERENCES `students` (`id`),
  CONSTRAINT `re_appear_ibfk_2` FOREIGN KEY (`faculty`) REFERENCES `mentor` (`id`),
  CONSTRAINT `re_appear_ibfk_3` FOREIGN KEY (`slot`) REFERENCES `time_slots` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `resources`;
CREATE TABLE `resources` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `icon_path` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `order_by` int NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `resources` (`id`, `name`, `icon_path`, `path`, `order_by`, `status`) VALUES
(1,	'Approval',	'\"\"',	'/approval',	1,	'1'),
(2,	'Students',	'\"\"',	'/student',	2,	'0'),
(3,	'Attendence',	'\"\"',	'/attendence',	3,	'1'),
(4,	'Dashboard',	'\"\"',	'/dashboard',	1,	'1'),
(5,	'Time Table',	'\"\"',	'/timetable',	4,	'0'),
(6,	'Leave Apply',	'\"\"',	'/leave',	2,	'1'),
(7,	'Mentor Map',	'\"\"',	'/mentor_map',	5,	'0'),
(8,	'Holidays',	'\"\"',	'/holidays',	6,	'0'),
(9,	'Semester Dates',	'\"\"',	'/sem-dates',	9,	'0'),
(10,	'Groups',	'\"\"',	'/group',	5,	'1'),
(11,	'Others',	'\"\"',	'/add',	3,	'1');

DROP TABLE IF EXISTS `role_resources`;
CREATE TABLE `role_resources` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL,
  `resources_id` bigint NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `role_id` (`role_id`),
  KEY `resources_id` (`resources_id`),
  CONSTRAINT `role_resources_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `role_resources_ibfk_2` FOREIGN KEY (`resources_id`) REFERENCES `resources` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `role_resources` (`id`, `role_id`, `resources_id`, `status`) VALUES
(1,	1,	1,	'1'),
(2,	1,	2,	'1'),
(3,	2,	3,	'0'),
(4,	1,	3,	'1'),
(5,	2,	4,	'1'),
(6,	1,	5,	'1'),
(7,	2,	6,	'1'),
(8,	1,	7,	'1'),
(9,	1,	8,	'1'),
(10,	1,	9,	'1'),
(11,	1,	11,	'1');

DROP TABLE IF EXISTS `role_student_map`;
CREATE TABLE `role_student_map` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_attendance` bigint NOT NULL,
  `student` bigint NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `role_attendance` (`role_attendance`),
  KEY `student` (`student`),
  CONSTRAINT `role_student_map_ibfk_1` FOREIGN KEY (`role_attendance`) REFERENCES `roles_attendance` (`id`),
  CONSTRAINT `role_student_map_ibfk_2` FOREIGN KEY (`student`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` enum('0','1','2') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `roles_attendance`;
CREATE TABLE `roles_attendance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `roles_student`;
CREATE TABLE `roles_student` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_map` int NOT NULL,
  `slot` int NOT NULL,
  `attendance` timestamp NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `slot` (`slot`),
  KEY `student_map` (`student_map`),
  CONSTRAINT `roles_student_ibfk_3` FOREIGN KEY (`slot`) REFERENCES `time_slots` (`id`),
  CONSTRAINT `roles_student_ibfk_4` FOREIGN KEY (`student_map`) REFERENCES `role_student_map` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `sem_date`;
CREATE TABLE `sem_date` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `year` varchar(255) NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `register_number` varchar(255) NOT NULL,
  `year` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `deparment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `gmail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` bigint NOT NULL,
  `role_id` bigint NOT NULL DEFAULT '2',
  `att_status` enum('0','1') NOT NULL DEFAULT '0',
  `app_date` timestamp NULL DEFAULT NULL,
  `status` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `students_ibfk_2` FOREIGN KEY (`type`) REFERENCES `type` (`id`),
  CONSTRAINT `students_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `time_slots`;
CREATE TABLE `time_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `start_time` varchar(10) NOT NULL,
  `end_time` varchar(10) NOT NULL,
  `status` enum('0','1') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `time_slots` (`id`, `label`, `start_time`, `end_time`, `status`) VALUES
(1,	'8:45AM - 9:45AM',	'8:45AM',	'9:45AM',	'1'),
(2,	'9:45AM - 10:45AM',	'9:45AM',	'10:45AM',	'1'),
(3,	'11:00AM - 12:00PM',	'11:00AM',	'12:00PM',	'1'),
(4,	'12:00PM - 1:00PM',	'12:00PM',	'1:00PM',	'1'),
(5,	'1:00PM - 2:00PM',	'1:00PM',	'2:00PM',	'1'),
(6,	'2:00PM - 3:00PM',	'2:00PM',	'3:00PM',	'1'),
(7,	'3:00PM - 4:00PM',	'3:00PM',	'4:00PM',	'1'),
(8,	'4:00PM - 5:00PM',	'4:00PM',	'5:00PM',	'0'),
(9,	'5:00PM - 6:00PM',	'5.00PM',	'6.00PM',	'0');

DROP TABLE IF EXISTS `type`;
CREATE TABLE `type` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  `status` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 2024-08-17 09:38:06
