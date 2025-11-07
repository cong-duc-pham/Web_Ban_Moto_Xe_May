-- Tạo bảng Question
CREATE TABLE [Question] (
    [QuestionId] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NOT NULL,
    [Title] NVARCHAR(500) NOT NULL,
    [Content] NVARCHAR(2000) NOT NULL,
    [VehicleId] INT NULL,
    [Category] NVARCHAR(50) NOT NULL DEFAULT 'General',
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'Open',
    [ViewCount] INT NOT NULL DEFAULT 0,
    [AnswerCount] INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Question_User FOREIGN KEY ([UserId]) REFERENCES [User]([UserId]) ON DELETE CASCADE,
    CONSTRAINT FK_Question_Vehicle FOREIGN KEY ([VehicleId]) REFERENCES [Vehicle]([VehicleId]) ON DELETE SET NULL
);

-- Tạo bảng Answer
CREATE TABLE [Answer] (
    [AnswerId] INT IDENTITY(1,1) PRIMARY KEY,
    [QuestionId] INT NOT NULL,
    [UserId] INT NOT NULL,
    [Content] NVARCHAR(2000) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [IsAccepted] BIT NOT NULL DEFAULT 0,
    [LikeCount] INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Answer_Question FOREIGN KEY ([QuestionId]) REFERENCES [Question]([QuestionId]) ON DELETE CASCADE,
    CONSTRAINT FK_Answer_User FOREIGN KEY ([UserId]) REFERENCES [User]([UserId]) ON DELETE NO ACTION
);

-- Tạo index để tăng hiệu suất truy vấn
CREATE INDEX IX_Question_UserId ON [Question]([UserId]);
CREATE INDEX IX_Question_VehicleId ON [Question]([VehicleId]);
CREATE INDEX IX_Question_Category ON [Question]([Category]);
CREATE INDEX IX_Question_Status ON [Question]([Status]);
CREATE INDEX IX_Question_CreatedAt ON [Question]([CreatedAt] DESC);
CREATE INDEX IX_Answer_QuestionId ON [Answer]([QuestionId]);
CREATE INDEX IX_Answer_UserId ON [Answer]([UserId]);

PRINT 'Created Question and Answer tables successfully!';
