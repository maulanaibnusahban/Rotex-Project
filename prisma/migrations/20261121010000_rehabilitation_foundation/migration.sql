-- CreateTable
CREATE TABLE `DoctorProfile` (
    `userId` CHAR(36) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientProfile` (
    `userId` CHAR(36) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientAssignment` (
    `id` CHAR(36) NOT NULL,
    `doctorId` CHAR(36) NOT NULL,
    `patientId` CHAR(36) NOT NULL,
    `assignedById` CHAR(36) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endedAt` DATETIME(3) NULL,

    INDEX `PatientAssignment_doctorId_endedAt_startedAt_idx`(`doctorId`, `endedAt`, `startedAt`),
    INDEX `PatientAssignment_patientId_endedAt_startedAt_idx`(`patientId`, `endedAt`, `startedAt`),
    INDEX `PatientAssignment_assignedById_idx`(`assignedById`),
    UNIQUE INDEX `PatientAssignment_doctorId_patientId_startedAt_key`(`doctorId`, `patientId`, `startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` CHAR(36) NOT NULL,
    `doctorId` CHAR(36) NOT NULL,
    `patientId` CHAR(36) NOT NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Appointment_doctorId_startAt_idx`(`doctorId`, `startAt`),
    INDEX `Appointment_doctorId_status_startAt_endAt_idx`(`doctorId`, `status`, `startAt`, `endAt`),
    INDEX `Appointment_patientId_status_startAt_idx`(`patientId`, `status`, `startAt`),
    INDEX `Appointment_status_startAt_idx`(`status`, `startAt`),
    UNIQUE INDEX `Appointment_id_doctorId_patientId_key`(`id`, `doctorId`, `patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppointmentChange` (
    `id` CHAR(36) NOT NULL,
    `appointmentId` CHAR(36) NOT NULL,
    `actorId` CHAR(36) NOT NULL,
    `type` ENUM('RESCHEDULED', 'STATUS_CHANGED') NOT NULL,
    `before` JSON NOT NULL,
    `after` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AppointmentChange_appointmentId_createdAt_idx`(`appointmentId`, `createdAt`),
    INDEX `AppointmentChange_actorId_idx`(`actorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TherapySession` (
    `id` CHAR(36) NOT NULL,
    `doctorId` CHAR(36) NOT NULL,
    `patientId` CHAR(36) NOT NULL,
    `appointmentId` CHAR(36) NULL,
    `therapyAt` DATETIME(3) NOT NULL,
    `shoulderSide` ENUM('LEFT', 'RIGHT', 'BOTH') NULL,
    `mode` ENUM('ACTIVE', 'PASSIVE') NULL,
    `durationMinutes` SMALLINT UNSIGNED NULL,
    `repetitions` SMALLINT UNSIGNED NULL,
    `initialCondition` TEXT NULL,
    `painScore` TINYINT UNSIGNED NULL,
    `painScaleMaximum` TINYINT UNSIGNED NULL,
    `observations` TEXT NULL,
    `assessment` TEXT NULL,
    `patientResponse` TEXT NULL,
    `followUpPlan` TEXT NULL,
    `postSessionNotes` TEXT NULL,
    `status` ENUM('DRAFT', 'FINALIZED') NOT NULL DEFAULT 'DRAFT',
    `version` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `finalizedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TherapySession_doctorId_status_updatedAt_idx`(`doctorId`, `status`, `updatedAt`),
    INDEX `TherapySession_patientId_status_therapyAt_idx`(`patientId`, `status`, `therapyAt`),
    UNIQUE INDEX `TherapySession_appointmentId_doctorId_patientId_key`(`appointmentId`, `doctorId`, `patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RomMeasurement` (
    `id` CHAR(36) NOT NULL,
    `sessionId` CHAR(36) NOT NULL,
    `movement` ENUM('FLEXION', 'EXTENSION', 'ABDUCTION', 'ADDUCTION') NOT NULL,
    `shoulderSide` ENUM('LEFT', 'RIGHT') NOT NULL,
    `degrees` DECIMAL(5, 2) NOT NULL,
    `method` ENUM('ROTEX_HANDLE_ANGLE', 'CALIBRATED_SHOULDER_ANGLE', 'GONIOMETER', 'OTHER') NOT NULL,
    `methodNotes` VARCHAR(255) NULL,
    `mode` ENUM('ACTIVE', 'PASSIVE') NULL,

    INDEX `RomMeasurement_sessionId_movement_shoulderSide_method_idx`(`sessionId`, `movement`, `shoulderSide`, `method`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JournalRevision` (
    `id` CHAR(36) NOT NULL,
    `sessionId` CHAR(36) NOT NULL,
    `authorId` CHAR(36) NOT NULL,
    `previousVersion` INTEGER UNSIGNED NOT NULL,
    `version` INTEGER UNSIGNED NOT NULL,
    `reason` TEXT NOT NULL,
    `before` JSON NOT NULL,
    `after` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `JournalRevision_authorId_idx`(`authorId`),
    UNIQUE INDEX `JournalRevision_sessionId_version_key`(`sessionId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` CHAR(36) NOT NULL,
    `actorId` CHAR(36) NOT NULL,
    `scope` ENUM('ADMINISTRATIVE', 'CLINICAL') NOT NULL,
    `action` ENUM('ACCOUNT_CREATED', 'ACCOUNT_UPDATED', 'ACCOUNT_STATUS_CHANGED', 'ASSIGNMENT_STARTED', 'ASSIGNMENT_ENDED', 'APPOINTMENT_CREATED', 'APPOINTMENT_CHANGED', 'JOURNAL_FINALIZED', 'JOURNAL_AMENDED') NOT NULL,
    `subjectId` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_scope_createdAt_idx`(`scope`, `createdAt`),
    INDEX `AuditLog_actorId_createdAt_idx`(`actorId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DoctorProfile` ADD CONSTRAINT `DoctorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientAssignment` ADD CONSTRAINT `PatientAssignment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `DoctorProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientAssignment` ADD CONSTRAINT `PatientAssignment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `PatientProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientAssignment` ADD CONSTRAINT `PatientAssignment_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `DoctorProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `PatientProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppointmentChange` ADD CONSTRAINT `AppointmentChange_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AppointmentChange` ADD CONSTRAINT `AppointmentChange_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapySession` ADD CONSTRAINT `TherapySession_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `DoctorProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapySession` ADD CONSTRAINT `TherapySession_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `PatientProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TherapySession` ADD CONSTRAINT `TherapySession_appointmentId_doctorId_patientId_fkey` FOREIGN KEY (`appointmentId`, `doctorId`, `patientId`) REFERENCES `Appointment`(`id`, `doctorId`, `patientId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RomMeasurement` ADD CONSTRAINT `RomMeasurement_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `TherapySession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JournalRevision` ADD CONSTRAINT `JournalRevision_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `TherapySession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JournalRevision` ADD CONSTRAINT `JournalRevision_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `DoctorProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Validasi nilai yang berlaku untuk semua penulis database.
ALTER TABLE `PatientAssignment` ADD CONSTRAINT `PatientAssignment_valid_period`
    CHECK (`endedAt` IS NULL OR `endedAt` >= `startedAt`);

ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_valid_interval`
    CHECK (`endAt` > `startAt`);

ALTER TABLE `TherapySession`
    ADD CONSTRAINT `TherapySession_valid_finalization`
        CHECK ((`status` = 'DRAFT' AND `finalizedAt` IS NULL) OR (`status` = 'FINALIZED' AND `finalizedAt` IS NOT NULL)),
    ADD CONSTRAINT `TherapySession_positive_version` CHECK (`version` >= 1),
    ADD CONSTRAINT `TherapySession_valid_pain_scale`
        CHECK ((`painScore` IS NULL AND `painScaleMaximum` IS NULL) OR
               (`painScore` IS NOT NULL AND `painScaleMaximum` IS NOT NULL AND `painScaleMaximum` > 0 AND `painScore` <= `painScaleMaximum`));

ALTER TABLE `JournalRevision` ADD CONSTRAINT `JournalRevision_consecutive_versions`
    CHECK (`previousVersion` >= 1 AND `version` = `previousVersion` + 1);

-- Buat tautan profil untuk akun yang sudah ada.
INSERT INTO `DoctorProfile` (`userId`) SELECT `id` FROM `User` WHERE `role` = 'DOCTOR';
INSERT INTO `PatientProfile` (`userId`) SELECT `id` FROM `User` WHERE `role` = 'PATIENT';
