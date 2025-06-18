#include <napi.h>
#include <string>
#include <vector>
#include <algorithm>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <cmath>

// 時間間隔を表す構造体
struct TimeInterval {
    int64_t start;  // 開始時刻（分単位のタイムスタンプ）
    int64_t end;    // 終了時刻（分単位のタイムスタンプ）
    std::string id; // スロットID
    
    TimeInterval(int64_t s, int64_t e, const std::string& i) : start(s), end(e), id(i) {}
    
    // 二つの間隔が重なるかチェック
    bool overlaps(const TimeInterval& other) const {
        return start < other.end && end > other.start;
    }
    
    // 二つの間隔の最小距離を計算（分単位）
    int64_t distanceTo(const TimeInterval& other) const {
        if (overlaps(other)) return 0;
        return std::min(std::abs(other.start - end), std::abs(start - other.end));
    }
};

// analyzeSlot関数：スロットIDの文字列長を返す
Napi::Number AnalyzeSlot(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    // 引数チェック
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
        return Napi::Number::New(env, 0);
    }
    
    // スロットIDを取得
    std::string slotId = info[0].As<Napi::String>().Utf8Value();
    
    // 文字列長を返す
    return Napi::Number::New(env, slotId.length());
}

// 時間文字列をタイムスタンプに変換するヘルパー関数
int64_t parseTimeString(const std::string& timeStr) {
    std::tm tm = {};
    std::istringstream ss(timeStr);
    ss >> std::get_time(&tm, "%Y-%m-%d %H:%M");
    
    auto tp = std::chrono::system_clock::from_time_t(std::mktime(&tm));
    return std::chrono::duration_cast<std::chrono::minutes>(tp.time_since_epoch()).count();
}

// isConflict関数：時間間隔の競合を高度にチェック
bool isConflict(int64_t start, int64_t end, const std::vector<TimeInterval>& intervals, int64_t minGapMinutes = 60) {
    TimeInterval newInterval(start, end, "new");
    
    for (const auto& interval : intervals) {
        // 重なりチェック
        if (newInterval.overlaps(interval)) {
            return true;
        }
        
        // 最小間隔チェック
        if (newInterval.distanceTo(interval) < minGapMinutes) {
            return true;
        }
    }
    
    return false;
}

// checkConflict関数：予約時間の競合をチェック（改良版）
Napi::Boolean CheckConflict(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    // 引数チェック：配列と文字列
    if (info.Length() < 2 || !info[0].IsArray() || !info[1].IsString()) {
        Napi::TypeError::New(env, "Array and String expected").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }
    
    Napi::Array slotsArray = info[0].As<Napi::Array>();
    std::string newTime = info[1].As<Napi::String>().Utf8Value();
    
    // 新しい予約の時間間隔（デフォルトで60分のセッション）
    int64_t newStart = parseTimeString(newTime);
    int64_t newEnd = newStart + 60;  // 60分のセッション
    
    // 既存の予約済み間隔を収集
    std::vector<TimeInterval> reservedIntervals;
    
    for (uint32_t i = 0; i < slotsArray.Length(); i++) {
        Napi::Object slot = slotsArray.Get(i).As<Napi::Object>();
        
        // 予約済みのスロットのみ処理
        bool reserved = slot.Get("reserved").As<Napi::Boolean>().Value();
        if (reserved) {
            std::string existingTime = slot.Get("time").As<Napi::String>().Utf8Value();
            std::string slotId = slot.Get("id").As<Napi::String>().Utf8Value();
            int64_t existingStart = parseTimeString(existingTime);
            int64_t existingEnd = existingStart + 60;  // 60分のセッション
            
            reservedIntervals.emplace_back(existingStart, existingEnd, slotId);
        }
    }
    
    // 競合チェック（最小間隔60分）
    bool hasConflict = isConflict(newStart, newEnd, reservedIntervals, 60);
    
    return Napi::Boolean::New(env, hasConflict);
}

// calculateOptimalSlot関数：最適な予約スロットを計算（高度な処理のデモ）
Napi::Object CalculateOptimalSlot(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Object result = Napi::Object::New(env);
    
    if (info.Length() < 1 || !info[0].IsArray()) {
        result.Set("error", "Array expected");
        return result;
    }
    
    Napi::Array slotsArray = info[0].As<Napi::Array>();
    std::vector<std::pair<int64_t, bool>> slots;
    
    // スロット情報を収集
    for (uint32_t i = 0; i < slotsArray.Length(); i++) {
        Napi::Object slot = slotsArray.Get(i).As<Napi::Object>();
        std::string time = slot.Get("time").As<Napi::String>().Utf8Value();
        bool reserved = slot.Get("reserved").As<Napi::Boolean>().Value();
        
        slots.push_back({parseTimeString(time), reserved});
    }
    
    // 最も空いている時間帯を探す（簡易版）
    int maxGap = 0;
    int64_t optimalTime = 0;
    
    for (size_t i = 0; i < slots.size() - 1; i++) {
        if (!slots[i].second && !slots[i+1].second) {
            int gap = slots[i+1].first - slots[i].first;
            if (gap > maxGap) {
                maxGap = gap;
                optimalTime = slots[i].first;
            }
        }
    }
    
    result.Set("optimalTimeStamp", Napi::Number::New(env, optimalTime));
    result.Set("gapMinutes", Napi::Number::New(env, maxGap));
    
    return result;
}

// モジュールの初期化
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "analyzeSlot"),
                Napi::Function::New(env, AnalyzeSlot));
    exports.Set(Napi::String::New(env, "checkConflict"),
                Napi::Function::New(env, CheckConflict));
    exports.Set(Napi::String::New(env, "calculateOptimalSlot"),
                Napi::Function::New(env, CalculateOptimalSlot));
    return exports;
}

NODE_API_MODULE(slot_analyzer, Init)