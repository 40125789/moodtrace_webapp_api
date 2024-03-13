-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 13, 2024 at 04:23 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `moodtrace_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `contextual_trigger`
--

CREATE TABLE `contextual_trigger` (
  `trigger_id` int(11) NOT NULL,
  `trigger_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `contextual_trigger`
--

INSERT INTO `contextual_trigger` (`trigger_id`, `trigger_name`) VALUES
(1, 'Weather'),
(2, 'Work'),
(3, 'Exercise'),
(4, 'Family'),
(5, 'School'),
(6, 'Sleep'),
(7, 'Date'),
(8, 'Food'),
(9, 'Promotion'),
(10, 'Relationships'),
(11, 'Holiday'),
(12, 'Special Occasion');

-- --------------------------------------------------------

--
-- Table structure for table `snapshot`
--

CREATE TABLE `snapshot` (
  `snapshot_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `enjoyment_level` int(11) NOT NULL,
  `sadness_level` int(11) NOT NULL,
  `anger_level` int(11) NOT NULL,
  `contempt_level` int(11) NOT NULL,
  `disgust_level` int(11) NOT NULL,
  `fear_level` int(11) NOT NULL,
  `surprise_level` int(11) NOT NULL,
  `date_time` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `snapshot`
--

INSERT INTO `snapshot` (`snapshot_id`, `user_id`, `enjoyment_level`, `sadness_level`, `anger_level`, `contempt_level`, `disgust_level`, `fear_level`, `surprise_level`, `date_time`) VALUES
(905, 179, 10, 1, 0, 2, 0, 1, 8, '2024-03-01 15:00:00.000000'),
(906, 179, 0, 7, 8, 0, 4, 0, 1, '2024-03-02 13:00:00.000000'),
(909, 179, 1, 6, 1, 3, 10, 8, 1, '2024-02-28 14:20:00.000000'),
(911, 179, 0, 8, 6, 6, 1, 7, 1, '2024-02-26 09:00:00.000000'),
(925, 179, 8, 3, 5, 2, 1, 4, 6, '2024-02-08 12:00:00.000000'),
(926, 179, 8, 3, 5, 2, 1, 4, 6, '2024-02-08 12:00:00.000000');

-- --------------------------------------------------------

--
-- Table structure for table `snapshot_trigger`
--

CREATE TABLE `snapshot_trigger` (
  `snapshot_trigger_id` int(11) NOT NULL,
  `snapshot_id` int(11) NOT NULL,
  `trigger_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `snapshot_trigger`
--

INSERT INTO `snapshot_trigger` (`snapshot_trigger_id`, `snapshot_id`, `trigger_id`) VALUES
(2936, 906, 3),
(2973, 905, 9),
(2975, 925, 8),
(2976, 925, 6),
(2977, 911, 6),
(2978, 926, 8),
(2979, 926, 6),
(2980, 909, 6);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `firstname` text NOT NULL,
  `surname` text NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `password` varbinary(255) NOT NULL,
  `reset_token` varbinary(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `firstname`, `surname`, `email_address`, `password`, `reset_token`) VALUES
(179, 'John', 'Doe', 'john.doe@example.com', 0x2432622431302477556e546c44616c334246627170326b2f41514d4965656a356f5a59726d5269694b414a753934713531483364723830537738764b, 0x33383065653063653439333766346436663135303838393236626661383164666238656536643533),
(192, 'Kathleen', 'Williamson', 'kathleen79@ethereal.email', 0x243262243130247651724e6f6d615148314669396732506c6e7a75627573764b6768624c5957356d596d764d4b764f453574456b4143685977647047, ''),
(195, 'Claire', 'Smyth', 'ya9maha8@@gmail.com', 0x24326224313024766a2f51324e5341787a386a305152366b68617134753844324e754264326e656a572f50574758346334323333476a68335644642e, '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contextual_trigger`
--
ALTER TABLE `contextual_trigger`
  ADD PRIMARY KEY (`trigger_id`);

--
-- Indexes for table `snapshot`
--
ALTER TABLE `snapshot`
  ADD PRIMARY KEY (`snapshot_id`),
  ADD KEY `fk_user_user_id` (`user_id`);

--
-- Indexes for table `snapshot_trigger`
--
ALTER TABLE `snapshot_trigger`
  ADD PRIMARY KEY (`snapshot_trigger_id`),
  ADD KEY `FK_snapshot_trigger_snapshot_id` (`snapshot_id`),
  ADD KEY `FK_snapshot_trigger_trigger_id` (`trigger_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contextual_trigger`
--
ALTER TABLE `contextual_trigger`
  MODIFY `trigger_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `snapshot`
--
ALTER TABLE `snapshot`
  MODIFY `snapshot_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=928;

--
-- AUTO_INCREMENT for table `snapshot_trigger`
--
ALTER TABLE `snapshot_trigger`
  MODIFY `snapshot_trigger_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2984;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=196;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `snapshot`
--
ALTER TABLE `snapshot`
  ADD CONSTRAINT `fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `snapshot_trigger`
--
ALTER TABLE `snapshot_trigger`
  ADD CONSTRAINT `FK_snapshot_trigger_snapshot_id` FOREIGN KEY (`snapshot_id`) REFERENCES `snapshot` (`snapshot_id`),
  ADD CONSTRAINT `FK_snapshot_trigger_trigger_id` FOREIGN KEY (`trigger_id`) REFERENCES `contextual_trigger` (`trigger_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
