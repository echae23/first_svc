// app.js

// ====== (데모용) 계정 데이터 ======
// 실제 운영에서는 절대 프론트에 전체 명단을 두면 안 됩니다.
// 다음 단계에서 "서버/시트 연동 구조"로 바꾸는 걸 권장.
const ACCOUNTS = [
  { studentNo: "1101", name: "홍길동", email: "1101hong@school.example" },
  { studentNo: "1102", name: "김민지", email: "1102kim@school.example" },
  { studentNo: "2103", name: "이채", email: "2103lee@school.example" },
];

// ====== DOM ======
const form = document.getElementById("searchForm");
const inputNo = document.getElementById("studentNo");
const inputName = document.getElementById("studentName");
const resultBox = document.getElementById("resultBox");
const btnResetGuide = document.getElementById("btnResetGuide");

// ====== 유틸 ======
function normalize(str) {
  return String(str ?? "")
    .trim()
    .replace(/\s+/g, " "); // 연속 공백 정리
}

function renderMessage(html) {
  resultBox.innerHTML = html;
}

function renderError(msg) {
  renderMessage(`
    <div role="alert" style="display:flex;gap:10px;align-items:flex-start;">
      <div style="font-size:20px;line-height:1;">⚠️</div>
      <div>
        <div style="font-weight:700;margin-bottom:4px;">조회 실패</div>
        <div style="color:#6b7280;font-size:14px;">${msg}</div>
      </div>
    </div>
  `);
}

function renderSuccess(account) {
  renderMessage(`
    <div style="display:flex;gap:10px;align-items:flex-start;">
      <div style="font-size:20px;line-height:1;">✅</div>
      <div style="flex:1;">
        <div style="font-weight:800;margin-bottom:8px;">계정 확인 완료</div>

        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:12px;">
          <div style="color:#6b7280;font-size:12px;margin-bottom:4px;">구글 계정 ID</div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <code style="font-size:14px;font-weight:700;">${account.email}</code>
            <button type="button" id="btnCopyEmail" style="height:34px;padding:0 12px;border-radius:10px;">
              복사
            </button>
          </div>
        </div>

        <div style="margin-top:10px;color:#6b7280;font-size:13px;">
          비밀번호는 보안상 표시하지 않습니다. 필요 시 “비밀번호 재설정 안내”를 이용하세요.
        </div>
      </div>
    </div>
  `);

  // 결과 렌더 후 복사 버튼 이벤트 연결
  const btnCopy = document.getElementById("btnCopyEmail");
  btnCopy?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(account.email);
      btnCopy.textContent = "복사됨!";
      setTimeout(() => (btnCopy.textContent = "복사"), 900);
    } catch (e) {
      alert("복사에 실패했어요. 이메일을 드래그해서 복사해주세요.");
    }
  });
}

// ====== 검색 로직 ======
// Inko 인스턴스 (CDN 로드 후 전역으로 Inko가 생김)
const inko = new Inko();

// ====== 검색 로직 ======
function findAccount(studentNo, name) {
  const no = normalize(studentNo);
  const nm = normalize(name);

  // 1) 원본 그대로 검색
  let found = ACCOUNTS.find(
    (a) => normalize(a.studentNo) === no && normalize(a.name) === nm
  );
  if (found) return found;

  // 2) 키보드 배열 실수(영타로 찍힌 한글)를 한글로 변환해서 재검색
  const nm2 = normalize(inko.en2ko(nm));
  if (nm2 !== nm) {
    found = ACCOUNTS.find(
      (a) => normalize(a.studentNo) === no && normalize(a.name) === nm2
    );
    if (found) return found;
  }

  return null;
}


// ====== 이벤트 ======
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const studentNo = inputNo.value;
  const name = inputName.value;

  // ✅ 디버그 로그 (개발자도구 Console에서 확인)
  console.log("[INPUT RAW]", { studentNo, name });
  console.log("[INPUT NORM]", { studentNo: normalize(studentNo), name: normalize(name) });
  console.log("[ACCOUNTS]", ACCOUNTS);

  if (!normalize(studentNo) || !normalize(name)) {
    renderError("학번과 이름을 모두 입력하세요.");
    return;
  }

  const account = findAccount(studentNo, name);

  if (!account) {
    renderError("일치하는 정보가 없습니다. 학번/이름 오타를 확인하세요.");
    return;
  }

  renderSuccess(account);
});

btnResetGuide.addEventListener("click", () => {
  alert(
    [
      "비밀번호 재설정 안내",
      "",
      "1) 계정 ID(이메일)을 확인합니다.",
      "2) 학교/관리자 정책에 따라 다음 중 하나로 진행합니다:",
      "   - 구글 비밀번호 재설정(본인 인증 기반)",
      "   - 관리자 승인 후 임시 비밀번호 발급",
      "3) 임시 비밀번호는 즉시 변경하도록 안내합니다.",
    ].join("\n")
  );
});

