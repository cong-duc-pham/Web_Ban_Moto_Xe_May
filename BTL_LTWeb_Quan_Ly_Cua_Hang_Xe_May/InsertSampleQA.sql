-- Insert sample questions and answers
-- Giả sử UserId = 1 là admin, UserId = 2 là khách hàng

-- Question 1: Về việc mua xe
INSERT INTO [Question] (UserId, Title, Content, Category, CreatedAt, ViewCount, AnswerCount, Status)
VALUES 
(2, N'Honda SH 2024 có tiêu tốn xăng không?', 
 N'Em đang có ý định mua Honda SH 2024, không biết xe này có tiêu tốn xăng không ạ? Mọi người cho em xin ý kiến với!', 
 'Vehicle', GETDATE(), 15, 0, 'Open');

-- Question 2: Về thanh toán
INSERT INTO [Question] (UserId, Title, Content, Category, CreatedAt, ViewCount, AnswerCount, Status)
VALUES 
(2, N'Cửa hàng có hỗ trợ trả góp không?', 
 N'Anh/chị cho em hỏi cửa hàng có hỗ trợ mua xe trả góp không ạ? Thủ tục ra sao?', 
 'Payment', GETDATE(), 23, 0, 'Open');

-- Question 3: Về giao hàng
INSERT INTO [Question] (UserId, Title, Content, Category, CreatedAt, ViewCount, AnswerCount, Status)
VALUES 
(2, N'Thời gian giao xe mất bao lâu?', 
 N'Em đặt mua xe rồi thì bao lâu cửa hàng sẽ giao xe ạ? Em đang cần gấp!', 
 'Delivery', GETDATE(), 18, 0, 'Open');

-- Question 4: Câu hỏi chung
INSERT INTO [Question] (UserId, Title, Content, Category, CreatedAt, ViewCount, AnswerCount, Status)
VALUES 
(2, N'Làm sao để kiểm tra xe cũ trước khi mua?', 
 N'Em định mua xe cũ nhưng không biết kiểm tra những gì. Mọi người chỉ em cách kiểm tra xe cũ trước khi mua với ạ!', 
 'General', GETDATE(), 42, 0, 'Open');

-- Question 5: Về xe máy cụ thể
INSERT INTO [Question] (UserId, Title, Content, VehicleId, Category, CreatedAt, ViewCount, AnswerCount, Status)
VALUES 
(2, N'Yamaha Exciter 155 có phù hợp chạy đường dài không?', 
 N'Em thường xuyên phải di chuyển đường dài, không biết Exciter 155 có phù hợp không ạ? Về mặt tiện nghi và tiết kiệm xăng thế nào?', 
 NULL, 'Vehicle', GETDATE(), 31, 0, 'Open');

PRINT 'Inserted 5 sample questions successfully!';

-- Add some sample answers (after questions are created)
DECLARE @Q1 INT, @Q2 INT, @Q3 INT, @Q4 INT, @Q5 INT;

SELECT @Q1 = QuestionId FROM [Question] WHERE Title LIKE N'%Honda SH 2024%';
SELECT @Q2 = QuestionId FROM [Question] WHERE Title LIKE N'%trả góp%';
SELECT @Q3 = QuestionId FROM [Question] WHERE Title LIKE N'%Thời gian giao xe%';
SELECT @Q4 = QuestionId FROM [Question] WHERE Title LIKE N'%kiểm tra xe cũ%';
SELECT @Q5 = QuestionId FROM [Question] WHERE Title LIKE N'%Exciter 155%';

-- Answers for Question 1
IF @Q1 IS NOT NULL
BEGIN
    INSERT INTO [Answer] (QuestionId, UserId, Content, CreatedAt, IsAccepted, LikeCount)
    VALUES 
    (@Q1, 1, N'Honda SH 2024 khá tiết kiệm xăng đấy bạn, trung bình khoảng 2.0-2.2 lít/100km tùy cách lái. Nếu bạn lái nhẹ nhàng thì còn tiết kiệm hơn nữa!', GETDATE(), 0, 5);
    
    UPDATE [Question] SET AnswerCount = 1, Status = 'Answered' WHERE QuestionId = @Q1;
END

-- Answers for Question 2
IF @Q2 IS NOT NULL
BEGIN
    INSERT INTO [Answer] (QuestionId, UserId, Content, CreatedAt, IsAccepted, LikeCount)
    VALUES 
    (@Q2, 1, N'Shop có hỗ trợ trả góp qua các công ty tài chính bạn nhé. Bạn cần chuẩn bị CMND, sổ hộ khẩu, và giấy tờ chứng minh thu nhập. Lãi suất khoảng 0.8-1%/tháng tùy công ty.', GETDATE(), 0, 3),
    (@Q2, 2, N'Mình mới mua trả góp ở đây tuần trước, thủ tục rất nhanh gọn. Chỉ cần 30 phút là duyệt xong!', GETDATE(), 0, 2);
    
    UPDATE [Question] SET AnswerCount = 2, Status = 'Answered' WHERE QuestionId = @Q2;
END

-- Answers for Question 3
IF @Q3 IS NOT NULL
BEGIN
    INSERT INTO [Answer] (QuestionId, UserId, Content, CreatedAt, IsAccepted, LikeCount)
    VALUES 
    (@Q3, 1, N'Sau khi shop xác nhận đơn hàng, thời gian giao xe thường từ 1-3 ngày tùy khu vực bạn nhé. Nếu xe có sẵn thì có thể giao trong ngày!', GETDATE(), 0, 4);
    
    UPDATE [Question] SET AnswerCount = 1, Status = 'Answered' WHERE QuestionId = @Q3;
END

-- Answers for Question 4
IF @Q4 IS NOT NULL
BEGIN
    INSERT INTO [Answer] (QuestionId, UserId, Content, CreatedAt, IsAccepted, LikeCount)
    VALUES 
    (@Q4, 1, N'Khi mua xe cũ bạn cần kiểm tra: 1) Số khung số máy, 2) Phanh trước sau, 3) Hệ thống đèn, 4) Lốp xe, 5) Giấy tờ xe rõ ràng. Nếu không am hiểu có thể nhờ thợ cùng đi kiểm tra!', GETDATE(), 0, 8),
    (@Q4, 2, N'Thêm nữa là kiểm tra cốp xe, yên xe, và test lái thử xem máy có êm không nhé bạn!', GETDATE(), 0, 3);
    
    UPDATE [Question] SET AnswerCount = 2, Status = 'Answered' WHERE QuestionId = @Q4;
END

-- Answers for Question 5
IF @Q5 IS NOT NULL
BEGIN
    INSERT INTO [Answer] (QuestionId, UserId, Content, CreatedAt, IsAccepted, LikeCount)
    VALUES 
    (@Q5, 1, N'Exciter 155 rất phù hợp cho đường dài bạn ơi! Động cơ khỏe, yên ngồi thoải mái, và tiết kiệm xăng. Mình hay chạy đường dài và rất hài lòng!', GETDATE(), 0, 6);
    
    UPDATE [Question] SET AnswerCount = 1, Status = 'Answered' WHERE QuestionId = @Q5;
END

PRINT 'Inserted sample answers successfully!';
