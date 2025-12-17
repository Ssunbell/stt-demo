# 📱 Expo Go 사용자 가이드

## ⚠️ 중요 안내

**Expo Go에서는 `react-native-live-audio-stream`과 같은 네이티브 모듈을 사용할 수 없습니다.**

이는 Expo Go의 제한사항으로, 커스텀 네이티브 코드를 포함할 수 없기 때문입니다.

---

## 🎯 해결 방법

### 1️⃣ 웹에서 테스트 (가장 빠르고 쉬움) ⭐️ 권장

웹 브라우저에서는 Web Audio API를 사용하므로 완벽하게 작동합니다:

```bash
npm run web
```

**장점**:
- ✅ 즉시 테스트 가능
- ✅ 실시간 오디오 스트리밍 완벽 지원
- ✅ 개발자 도구 사용 가능
- ✅ 빠른 리로드

**단점**:
- ❌ 모바일 UI/UX 정확히 재현 안 됨
- ❌ 모바일 전용 기능 테스트 불가

---

### 2️⃣ 로컬 네이티브 빌드 실행 (개발용)

네이티브 프로젝트를 생성하고 직접 실행합니다:

#### iOS:

```bash
# 1. 네이티브 프로젝트 생성 (처음 한 번만)
npx expo prebuild --platform ios

# 2. Pod 설치
cd ios && pod install && cd ..

# 3. 실행
npx expo run:ios
```

또는 간단하게:
```bash
npx expo run:ios
```
(prebuild와 pod install이 자동으로 실행됨)

#### Android:

```bash
# 네이티브 프로젝트 생성 및 실행
npx expo run:android
```

**장점**:
- ✅ 실제 모바일 환경에서 테스트
- ✅ 모든 네이티브 기능 사용 가능
- ✅ 빠른 개발 주기

**단점**:
- ❌ 초기 설정 시간 필요
- ❌ Xcode (iOS) 또는 Android Studio 필요

---

### 3️⃣ EAS Development Build (프로덕션 준비용)

클라우드에서 네이티브 앱을 빌드하고 기기에 설치합니다:

```bash
# 1. EAS CLI 설치
npm install -g eas-cli

# 2. Expo 계정으로 로그인
eas login

# 3. 프로젝트 설정
eas build:configure

# 4. Development Build 생성
eas build --profile development --platform ios
# 또는
eas build --profile development --platform android
# 또는 둘 다
eas build --profile development --platform all
```

빌드가 완료되면 (약 10-20분):
1. QR 코드가 제공됨
2. 기기에서 QR 코드 스캔
3. 앱 다운로드 및 설치
4. 개발 서버 실행: `npm start`
5. Development Build 앱에서 연결

**장점**:
- ✅ 실제 기기에서 테스트
- ✅ 로컬 빌드 환경 불필요
- ✅ 팀원과 공유 가능
- ✅ 여러 기기에서 테스트 가능

**단점**:
- ❌ 빌드 시간 (10-20분)
- ❌ Expo 계정 필요
- ❌ 빌드 큐 대기 시간 (무료 플랜)

---

## 🔄 각 방법 비교

| 방법 | 설정 시간 | 실행 속도 | 테스트 품질 | 권장 용도 |
|------|----------|----------|------------|-----------|
| **웹** | 0분 | ⚡️⚡️⚡️ | ⭐️⭐️⭐️ | 빠른 개발/테스트 |
| **로컬 빌드** | 5-10분 | ⚡️⚡️ | ⭐️⭐️⭐️⭐️⭐️ | 개발 중 |
| **EAS Build** | 10-20분 | ⚡️ | ⭐️⭐️⭐️⭐️⭐️ | 팀 공유/배포 |
| **Expo Go** | 0분 | ⚡️⚡️⚡️ | ❌ | 네이티브 모듈 없는 앱만 |

---

## 📋 빠른 시작 체크리스트

### 웹에서 테스트 (권장)

- [ ] 터미널 1: 서버 실행 (`cd server && python main.py`)
- [ ] 터미널 2: 웹 앱 실행 (`npm run web`)
- [ ] 브라우저에서 마이크 권한 허용
- [ ] "녹음 시작" 버튼 클릭
- [ ] 말하기
- [ ] 실시간 텍스트 확인! ✅

### 로컬 네이티브 빌드

- [ ] 서버 실행 중인지 확인
- [ ] `npx expo run:ios` 또는 `npx expo run:android`
- [ ] 앱 설치 대기 (처음에는 5-10분)
- [ ] 앱이 자동으로 실행됨
- [ ] 마이크 권한 허용
- [ ] 테스트 시작!

---

## 🐛 문제 해결

### "Module not found" 에러

```bash
# 의존성 재설치
rm -rf node_modules
npm install

# iOS Pod 재설치
cd ios
pod deintegrate
pod install
cd ..
```

### "Unable to resolve module" 에러

```bash
# Metro 번들러 캐시 삭제
npx expo start --clear
```

### 네이티브 빌드 실패

```bash
# iOS
cd ios
xcodebuild clean
cd ..
npx expo run:ios

# Android
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

## 💡 추천 워크플로우

### 개발 단계:

1. **초기 개발**: 웹에서 빠르게 테스트
2. **기능 완성**: 로컬 네이티브 빌드로 모바일 테스트
3. **QA/배포**: EAS Build로 팀원에게 공유

### 일상적인 개발:

```bash
# 터미널 1: 서버
cd server && python main.py

# 터미널 2: 웹 (빠른 테스트)
npm run web

# 터미널 3: 네이티브 (필요시)
npx expo run:ios
```

---

## 📚 추가 리소스

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [프로젝트 QUICKSTART_STREAMING.md](./QUICKSTART_STREAMING.md)
- [프로젝트 TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## ❓ FAQ

**Q: Expo Go를 계속 사용할 수 없나요?**  
A: 네이티브 모듈이 필요한 기능은 사용할 수 없습니다. 웹 버전을 사용하거나 Development Build를 생성하세요.

**Q: 매번 네이티브 빌드를 해야 하나요?**  
A: 아니요. 한 번 빌드하면 JavaScript 코드 변경은 빠르게 반영됩니다.

**Q: 웹 버전의 기능이 모바일과 같나요?**  
A: 네, AudioService가 플랫폼별로 최적화되어 있어 동일한 기능을 제공합니다.

**Q: EAS Build 비용은?**  
A: 무료 플랜에서도 Development Build를 만들 수 있습니다 (빌드 시간 제한 있음).

---

**작성일**: 2024-12-14  
**버전**: 1.0.0

