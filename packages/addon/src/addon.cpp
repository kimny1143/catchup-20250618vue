#include <napi.h>
#include <string>

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

// モジュールの初期化
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "analyzeSlot"),
                Napi::Function::New(env, AnalyzeSlot));
    return exports;
}

NODE_API_MODULE(slot_analyzer, Init)