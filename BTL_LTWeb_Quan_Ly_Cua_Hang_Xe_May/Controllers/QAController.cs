using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.EF;
using BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Models.Entities;

namespace BTL_LTWeb_Quan_Ly_Cua_Hang_Xe_May.Controllers
{
    public class QAController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<QAController> _logger;

        public QAController(ApplicationDbContext context, ILogger<QAController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Trang danh sách câu hỏi
        public async Task<IActionResult> Index(string? category, string? search, string? sort)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            var roleName = HttpContext.Session.GetString("RoleName");
            ViewBag.IsLoggedIn = userId.HasValue;
            ViewBag.IsAdmin = roleName != null && roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase);

            var query = _context.Questions
                .Include(q => q.User)
                .Include(q => q.Vehicle)
                .Include(q => q.Answers)
                .AsQueryable();

            // Lọc theo category
            if (!string.IsNullOrEmpty(category) && category != "All")
            {
                query = query.Where(q => q.Category == category);
            }

            // Tìm kiếm
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(q => q.Title.Contains(search) || q.Content.Contains(search));
            }

            // Sắp xếp
            query = sort switch
            {
                "oldest" => query.OrderBy(q => q.CreatedAt),
                "mostviewed" => query.OrderByDescending(q => q.ViewCount),
                "mostanswered" => query.OrderByDescending(q => q.AnswerCount),
                _ => query.OrderByDescending(q => q.CreatedAt) // newest (default)
            };

            var questions = await query.ToListAsync();

            ViewBag.CurrentCategory = category ?? "All";
            ViewBag.CurrentSearch = search;
            ViewBag.CurrentSort = sort ?? "newest";

            return View(questions);
        }

        // Trang chi tiết câu hỏi
        public async Task<IActionResult> Detail(int id)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            var roleName = HttpContext.Session.GetString("RoleName");
            
            _logger.LogInformation($"=== QA DETAIL PAGE ===");
            _logger.LogInformation($"UserId: {userId}");
            _logger.LogInformation($"RoleName: {roleName}");
            
            ViewBag.IsLoggedIn = userId.HasValue;
            ViewBag.IsAdmin = roleName != null && roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase);
            ViewBag.CurrentUserId = userId;
            
            _logger.LogInformation($"ViewBag.IsLoggedIn: {ViewBag.IsLoggedIn}");
            _logger.LogInformation($"ViewBag.IsAdmin: {ViewBag.IsAdmin}");

            var question = await _context.Questions
                .Include(q => q.User)
                .Include(q => q.Vehicle)
                .Include(q => q.Answers)
                    .ThenInclude(a => a.User)
                .FirstOrDefaultAsync(q => q.QuestionId == id);

            if (question == null)
            {
                return NotFound();
            }

            // Tăng lượt xem
            question.ViewCount++;
            await _context.SaveChangesAsync();

            return View(question);
        }

        // POST: Tạo câu hỏi mới
        [HttpPost]
        public async Task<IActionResult> CreateQuestion([FromBody] CreateQuestionRequest request)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                if (!userId.HasValue)
                {
                    return Json(new { success = false, message = "Vui lòng đăng nhập để đặt câu hỏi!" });
                }

                if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length < 10)
                {
                    return Json(new { success = false, message = "Tiêu đề phải có ít nhất 10 ký tự!" });
                }

                if (string.IsNullOrWhiteSpace(request.Content) || request.Content.Length < 20)
                {
                    return Json(new { success = false, message = "Nội dung câu hỏi phải có ít nhất 20 ký tự!" });
                }

                var question = new Question
                {
                    UserId = userId.Value,
                    Title = request.Title.Trim(),
                    Content = request.Content.Trim(),
                    VehicleId = request.VehicleId,
                    Category = request.Category ?? "General",
                    CreatedAt = DateTime.Now,
                    Status = "Open",
                    ViewCount = 0,
                    AnswerCount = 0
                };

                _context.Questions.Add(question);
                await _context.SaveChangesAsync();

                return Json(new { 
                    success = true, 
                    message = "Câu hỏi đã được đăng thành công!", 
                    questionId = question.QuestionId 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo câu hỏi");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: Trả lời câu hỏi
        [HttpPost]
        public async Task<IActionResult> CreateAnswer([FromBody] CreateAnswerRequest request)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                if (!userId.HasValue)
                {
                    return Json(new { success = false, message = "Vui lòng đăng nhập để trả lời!" });
                }

                if (string.IsNullOrWhiteSpace(request.Content) || request.Content.Length < 10)
                {
                    return Json(new { success = false, message = "Câu trả lời phải có ít nhất 10 ký tự!" });
                }

                var question = await _context.Questions.FindAsync(request.QuestionId);
                if (question == null)
                {
                    return Json(new { success = false, message = "Câu hỏi không tồn tại!" });
                }

                var answer = new Answer
                {
                    QuestionId = request.QuestionId,
                    UserId = userId.Value,
                    Content = request.Content.Trim(),
                    CreatedAt = DateTime.Now,
                    IsAccepted = false,
                    LikeCount = 0
                };

                _context.Answers.Add(answer);

                // Cập nhật số lượng câu trả lời
                question.AnswerCount++;
                question.Status = "Answered";

                await _context.SaveChangesAsync();

                // Load user info để trả về
                await _context.Entry(answer).Reference(a => a.User).LoadAsync();

                return Json(new { 
                    success = true, 
                    message = "Câu trả lời đã được đăng!",
                    answer = new {
                        answerId = answer.AnswerId,
                        content = answer.Content,
                        userName = answer.User?.FullName ?? "Người dùng",
                        createdAt = answer.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                        isAccepted = answer.IsAccepted,
                        likeCount = answer.LikeCount
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo câu trả lời");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: Chấp nhận câu trả lời (chỉ người đặt câu hỏi)
        [HttpPost]
        public async Task<IActionResult> AcceptAnswer(int answerId)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                if (!userId.HasValue)
                {
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });
                }

                var answer = await _context.Answers
                    .Include(a => a.Question)
                    .FirstOrDefaultAsync(a => a.AnswerId == answerId);

                if (answer == null)
                {
                    return Json(new { success = false, message = "Câu trả lời không tồn tại!" });
                }

                // Chỉ người đặt câu hỏi mới được chấp nhận câu trả lời
                if (answer.Question.UserId != userId.Value)
                {
                    return Json(new { success = false, message = "Bạn không có quyền thực hiện thao tác này!" });
                }

                // Bỏ chấp nhận các câu trả lời khác
                var otherAnswers = await _context.Answers
                    .Where(a => a.QuestionId == answer.QuestionId && a.AnswerId != answerId)
                    .ToListAsync();
                foreach (var other in otherAnswers)
                {
                    other.IsAccepted = false;
                }

                // Chấp nhận câu trả lời này
                answer.IsAccepted = true;
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Đã chấp nhận câu trả lời!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi chấp nhận câu trả lời");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }

        // POST: Xóa câu hỏi (admin hoặc người tạo)
        [HttpPost]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            try
            {
                var userId = HttpContext.Session.GetInt32("UserId");
                var roleName = HttpContext.Session.GetString("RoleName");
                var isAdmin = roleName != null && roleName.Equals("Admin", StringComparison.OrdinalIgnoreCase);

                if (!userId.HasValue)
                {
                    return Json(new { success = false, message = "Vui lòng đăng nhập!" });
                }

                var question = await _context.Questions.FindAsync(id);
                if (question == null)
                {
                    return Json(new { success = false, message = "Câu hỏi không tồn tại!" });
                }

                // Chỉ admin hoặc người tạo mới được xóa
                if (!isAdmin && question.UserId != userId.Value)
                {
                    return Json(new { success = false, message = "Bạn không có quyền xóa câu hỏi này!" });
                }

                _context.Questions.Remove(question);
                await _context.SaveChangesAsync();

                return Json(new { success = true, message = "Đã xóa câu hỏi!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa câu hỏi");
                return Json(new { success = false, message = $"Lỗi: {ex.Message}" });
            }
        }
    }

    // Request models
    public class CreateQuestionRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int? VehicleId { get; set; }
        public string? Category { get; set; }
    }

    public class CreateAnswerRequest
    {
        public int QuestionId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
