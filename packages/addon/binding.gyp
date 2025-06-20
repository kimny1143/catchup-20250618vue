{
  "targets": [
    {
      "target_name": "slot_analyzer",
      "sources": ["src/addon.cpp"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "xcode_settings": {
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
        "CLANG_CXX_LIBRARY": "libc++",
        "MACOSX_DEPLOYMENT_TARGET": "10.7"
      },
      "msvs_settings": {
        "VCCLCompilerTool": { "ExceptionHandling": 1 }
      },
      "conditions": [
        ["OS=='mac'", {
          "cflags+": ["-fvisibility=hidden"],
          "xcode_settings": {
            "GCC_SYMBOLS_PRIVATE_EXTERN": "YES"
          }
        }]
      ]
    }
  ]
}