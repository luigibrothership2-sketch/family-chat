export type Language = 'en' | 'ar';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  encryptedNotice: string;
  radarNotice: string;
  kidNotice: string;
  signIn: string;
  createAccount: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  passwordOrPin: string;
  fullName: string;
  whoIsThisFor: string;
  parentRole: string;
  teenRole: string;
  childRole: string;
  guardianRole: string;
  childAccountNotice: string;
  familyNameOptional: string;
  selectAvatar: string;
  uploadCustomPhoto: string;
  customPhotoUploaded: string;
  loginButton: string;
  signupButton: string;
  logoutConfirm: string;
  logout: string;
  accountsOnDevice: string;
  // Navigation & Tabs
  chatsTab: string;
  radarTab: string;
  tasksTab: string;
  familyTab: string;
  familyCircles: string;
  directChats: string;
  noCirclesYet: string;
  createCircle: string;
  noDirectChatsYet: string;
  addMember: string;
  membersCount: string;
  vaultActive: string;
  onRadar: string;
  // Chat
  typeMessage: string;
  startFamilyConvo: string;
  chatHistoryClean: string;
  sayHello: string;
  checkIn: string;
  importantMessage: string;
  selfDestructToggle: string;
  selfDestructHint: string;
  send: string;
  recordingVoice: string;
  tapToStop: string;
  recordingTime: string;
  attachPhoto: string;
  attachDoc: string;
  downloadFile: string;
  downloadSuccess: string;
  viewVaultDoc: string;
  hoursRemaining: string;
  autoPurged: string;
  confidentialView: string;
  fastForwardTest: string;
  purgeNow: string;
  mediaExpiredText: string;
  zeroKnowledgeProtocol: string;
  closeViewer: string;
  audioCall: string;
  videoCall: string;
  screenShare: string;
  endCall: string;
  muteMic: string;
  unmuteMic: string;
  turnOffCam: string;
  turnOnCam: string;
  // Radar
  liveRadarTitle: string;
  radarScanning: string;
  gpsActive: string;
  gpsLivePrompt: string;
  enableGps: string;
  streamBattery: string;
  distanceAway: string;
  pingMember: string;
  pingSent: string;
  batteryStatus: string;
  charging: string;
  notCharging: string;
  // Tasks
  taskBoard: string;
  newTask: string;
  taskTitle: string;
  taskDescription: string;
  assignTo: string;
  priority: string;
  category: string;
  dueDate: string;
  createTaskButton: string;
  low: string;
  medium: string;
  high: string;
  chores: string;
  errands: string;
  school: string;
  health: string;
  event: string;
  pending: string;
  completed: string;
  inProgress: string;
  markDone: string;
  // Family Search & Directory
  searchMembersPlaceholder: string;
  searchHint: string;
  registeredUsers: string;
  userNotFound: string;
  connectChat: string;
  addToGroup: string;
  editNickname: string;
  nicknameSaved: string;
  saveNickname: string;
  cancel: string;
  createGroupTitle: string;
  createGroupDesc: string;
  groupNamePlaceholder: string;
  groupDescPlaceholder: string;
  selectMembersForCircle: string;
  createCircleSubmit: string;
  // Settings & Profile
  settings: string;
  languageLabel: string;
  changeLanguage: string;
  profileCustomization: string;
  uploadNewAvatar: string;
  avatarUpdated: string;
  onlineNow: string;
  lastSeenRecently: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Family Chat',
    appSubtitle: 'Private, encrypted family communications, real-time safety radar, and self-destructing documents.',
    encryptedNotice: 'End-to-End Encrypted',
    radarNotice: 'Live Family Radar',
    kidNotice: 'COPPA-Safe Kid Accounts',
    signIn: 'Sign In',
    createAccount: 'Create Family Account',
    username: 'Family Username',
    email: 'Email Address',
    phone: 'Mobile Phone Number',
    password: 'Password',
    passwordOrPin: 'Password or Child PIN',
    fullName: 'Full Name',
    whoIsThisFor: 'Who is this account for?',
    parentRole: 'Parent / Adult',
    teenRole: 'Teen / Sibling',
    childRole: 'Child (COPPA)',
    guardianRole: 'Guardian',
    childAccountNotice: 'Child accounts do not require an email address or phone number.',
    familyNameOptional: 'Family Circle Name (Optional)',
    selectAvatar: 'Select Family Avatar',
    uploadCustomPhoto: 'Upload Custom Avatar Photo',
    customPhotoUploaded: 'Custom Photo Ready',
    loginButton: 'Log In to Family Vault',
    signupButton: 'Create Family & Start Chatting',
    logoutConfirm: 'Are you sure you want to log out of Family Chat?',
    logout: 'Log Out',
    accountsOnDevice: 'Accounts on this device:',
    chatsTab: 'Chats',
    radarTab: 'Radar',
    tasksTab: 'Tasks',
    familyTab: 'Family',
    familyCircles: 'Family Circles',
    directChats: 'Direct Family Chats',
    noCirclesYet: 'No family circles yet',
    createCircle: '+ Create Circle',
    noDirectChatsYet: 'No direct family chats yet',
    addMember: '+ Add / Search',
    membersCount: 'members',
    vaultActive: 'Vault active',
    onRadar: 'On Radar',
    typeMessage: 'Type a private message...',
    startFamilyConvo: 'Start your real family conversation',
    chatHistoryClean: 'Your family chat is encrypted and ready. Send messages, voice notes, photos, or self-destructing files.',
    sayHello: 'Say Hello 👋',
    checkIn: 'Checking In 🏡',
    importantMessage: 'Important Message',
    selfDestructToggle: '1-Hr Self-Destruct Vault',
    selfDestructHint: 'Recipient has 1 hour to view before permanent deletion from cloud database',
    send: 'Send',
    recordingVoice: 'Recording voice note...',
    tapToStop: 'Tap to send',
    recordingTime: 'Duration',
    attachPhoto: 'Send Photo',
    attachDoc: 'Send Document',
    downloadFile: 'Download to Device',
    downloadSuccess: 'File downloaded successfully!',
    viewVaultDoc: 'Open 1-Hr Vault Document',
    hoursRemaining: 'remaining',
    autoPurged: 'EXPIRED & PURGED',
    confidentialView: 'CONFIDENTIAL • ACTIVE RECIPIENT VIEW',
    fastForwardTest: 'Fast-Forward 1-Hr (Test)',
    purgeNow: 'Purge Immediately',
    mediaExpiredText: 'As configured by the sender, this sensitive family document has automatically purged from cloud storage after 1 hour of viewing.',
    zeroKnowledgeProtocol: 'Zero-Knowledge Family Privacy Protocol',
    closeViewer: 'Close Viewer',
    audioCall: 'Audio Call',
    videoCall: 'Video Call',
    screenShare: 'Share Screen',
    endCall: 'End Call',
    muteMic: 'Mute',
    unmuteMic: 'Unmute',
    turnOffCam: 'Stop Video',
    turnOnCam: 'Start Video',
    liveRadarTitle: 'Live Family GPS Radar',
    radarScanning: 'Radar Polling Active',
    gpsActive: 'Live GPS Streaming Active',
    gpsLivePrompt: 'Enable live GPS coordinates to stream real-time location to your family circle',
    enableGps: 'Enable GPS Radar',
    streamBattery: 'Live Battery & Charging Telemetry',
    distanceAway: 'away',
    pingMember: 'Ping Location',
    pingSent: 'Radar Ping Broadcast Sent!',
    batteryStatus: 'Battery',
    charging: 'Charging',
    notCharging: 'On Battery',
    taskBoard: 'Shared Family Tasks',
    newTask: '+ New Task',
    taskTitle: 'Task Title',
    taskDescription: 'Description (optional)',
    assignTo: 'Assign To',
    priority: 'Priority',
    category: 'Category',
    dueDate: 'Due Date',
    createTaskButton: 'Create Task',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    chores: 'Chores',
    errands: 'Errands',
    school: 'School',
    health: 'Health',
    event: 'Event',
    pending: 'Pending',
    completed: 'Completed',
    inProgress: 'In Progress',
    markDone: 'Mark Done',
    searchMembersPlaceholder: 'Search by username, email, phone, or name...',
    searchHint: 'Find registered family members across devices and start a private chat or group',
    registeredUsers: 'Registered Family Members',
    userNotFound: 'No users found matching your search.',
    connectChat: 'Start Private Chat',
    addToGroup: 'Add to Circle',
    editNickname: 'Edit Nickname',
    nicknameSaved: 'Custom nickname saved!',
    saveNickname: 'Save Nickname',
    cancel: 'Cancel',
    createGroupTitle: 'Create New Family Circle',
    createGroupDesc: 'Create a permanent group for household, trips, or siblings.',
    groupNamePlaceholder: 'Circle Name (e.g., Jenkins Household, Weekend Trip)',
    groupDescPlaceholder: 'Circle description...',
    selectMembersForCircle: 'Select members to include in this circle:',
    createCircleSubmit: 'Create Circle',
    settings: 'Settings & Profile',
    languageLabel: 'Language / اللغة',
    changeLanguage: 'Switch to Arabic',
    profileCustomization: 'Profile & Avatar Customization',
    uploadNewAvatar: 'Upload Custom Avatar',
    avatarUpdated: 'Profile avatar updated across family network!',
    onlineNow: 'Online Now',
    lastSeenRecently: 'Recently Active',
  },
  ar: {
    appName: 'دردشة العائلة',
    appSubtitle: 'محادثات عائلية خاصة ومشفّرة، رادار أمان مباشر ووثائق ذاتية التدمير.',
    encryptedNotice: 'تشفير تام بين الطرفين',
    radarNotice: 'رادار العائلة المباشر',
    kidNotice: 'حسابات أطفال آمنة',
    signIn: 'تسجيل الدخول',
    createAccount: 'إنشاء حساب عائلي',
    username: 'اسم المستخدم العائلي',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف المحمول',
    password: 'كلمة المرور',
    passwordOrPin: 'كلمة المرور أو رمز الطفل',
    fullName: 'الاسم الكامل',
    whoIsThisFor: 'لمن هذا الحساب؟',
    parentRole: 'والد / ولي أمر',
    teenRole: 'مراهق / أخ',
    childRole: 'طفل (آمن للأطفال)',
    guardianRole: 'وصي',
    childAccountNotice: 'حسابات الأطفال لا تتطلب بريداً إلكترونياً أو رقم هاتف.',
    familyNameOptional: 'اسم العائلة (اختياري)',
    selectAvatar: 'اختر صورة رمزية',
    uploadCustomPhoto: 'رفع صورة شخصية مخصصة',
    customPhotoUploaded: 'الصورة جاهزة للرفع',
    loginButton: 'تسجيل الدخول إلى الخزنة',
    signupButton: 'إنشاء الحساب وبدء المحادثة',
    logoutConfirm: 'هل أنت متأكد من رغبتك في تسجيل الخروج من دردشة العائلة؟',
    logout: 'تسجيل الخروج',
    accountsOnDevice: 'الحسابات المسجلة على هذا الجهاز:',
    chatsTab: 'المحادثات',
    radarTab: 'الرادار',
    tasksTab: 'المهام',
    familyTab: 'العائلة',
    familyCircles: 'المجموعات العائلية',
    directChats: 'المحادثات المباشرة',
    noCirclesYet: 'لا توجد مجموعات عائلية حتى الآن',
    createCircle: '+ إنشاء مجموعة',
    noDirectChatsYet: 'لا توجد محادثات فردية حتى الآن',
    addMember: '+ إضافة / بحث',
    membersCount: 'أعضاء',
    vaultActive: 'الخزنة نشطة',
    onRadar: 'على الرادار',
    typeMessage: 'اكتب رسالة خاصة...',
    startFamilyConvo: 'ابدأ محادثتك العائلية الحقيقية',
    chatHistoryClean: 'محادثتك العائلية مشفرة وجاهزة. أرسل الرسائل، التسجيلات الصوتية، الصور، أو المستندات ذاتية التدمير.',
    sayHello: 'ألقِ التحية 👋',
    checkIn: 'تسجيل حضور 🏡',
    importantMessage: 'رسالة هامة',
    selfDestructToggle: 'خزنة ذاتية التدمير (ساعة واحدة)',
    selfDestructHint: 'أمام المستلم ساعة واحدة للمعاينة قبل الحذف النهائي التام من السحابة',
    send: 'إرسال',
    recordingVoice: 'جارٍ تسجيل رسالة صوتية...',
    tapToStop: 'اضغط للإرسال',
    recordingTime: 'المدة',
    attachPhoto: 'إرسال صورة',
    attachDoc: 'إرسال مستند',
    downloadFile: 'تنزيل إلى الجهاز',
    downloadSuccess: 'تم تنزيل الملف بنجاح!',
    viewVaultDoc: 'فتح مستند الخزنة (ساعة واحدة)',
    hoursRemaining: 'متبقية',
    autoPurged: 'منتهي الصلاحية ومحذوف',
    confidentialView: 'سري للغاية • معاينة المستلم المصرح له',
    fastForwardTest: 'تقديم ساعة (تجربة الحذف)',
    purgeNow: 'حذف فوري الآن',
    mediaExpiredText: 'وفقاً لإعدادات المرسل، تم حذف هذا المستند العائلي الحساس تلقائياً من التخزين السحابي بعد انقضاء ساعة من فتحه.',
    zeroKnowledgeProtocol: 'بروتوكول خصوصية العائلة المنعدم المعرفة',
    closeViewer: 'إغلاق المعاينة',
    audioCall: 'مكالمة صوتية',
    videoCall: 'مكالمة فيديو',
    screenShare: 'مشاركة الشاشة',
    endCall: 'إنهاء المكالمة',
    muteMic: 'كتم الميكروفون',
    unmuteMic: 'تشغيل الميكروفون',
    turnOffCam: 'إيقاف الكاميرا',
    turnOnCam: 'تشغيل الكاميرا',
    liveRadarTitle: 'رادار الـ GPS العائلي المباشر',
    radarScanning: 'فحص الرادار نشط',
    gpsActive: 'بث الموقع المباشر مفعل',
    gpsLivePrompt: 'قم بتفعيل إحداثيات الـ GPS المباشرة لبث موقعك في الوقت الفعلي لأفراد العائلة',
    enableGps: 'تفعيل رادار الـ GPS',
    streamBattery: 'قياسات البطارية والشحن في الوقت الحقيقي',
    distanceAway: 'يبعد',
    pingMember: 'إرسال تنبيه موقع',
    pingSent: 'تم إرسال إشعار الرادار بنجاح!',
    batteryStatus: 'البطارية',
    charging: 'قيد الشحن',
    notCharging: 'على البطارية',
    taskBoard: 'المهام العائلية المشتركة',
    newTask: '+ مهمة جديدة',
    taskTitle: 'عنوان المهمة',
    taskDescription: 'الوصف (اختياري)',
    assignTo: 'تعيين إلى',
    priority: 'الأولوية',
    category: 'التصنيف',
    dueDate: 'تاريخ الاستحقاق',
    createTaskButton: 'إضافة المهمة',
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
    chores: 'أعمال منزلية',
    errands: 'مشاوير وطلبات',
    school: 'مدرسة ودراسة',
    health: 'صحة وعافية',
    event: 'مناسبة عائلية',
    pending: 'قيد الانتظار',
    completed: 'مكتملة',
    inProgress: 'قيد التنفيذ',
    markDone: 'اكتملت',
    searchMembersPlaceholder: 'ابحث باسم المستخدم، البريد، الهاتف، أو الاسم...',
    searchHint: 'ابحث عن أفراد العائلة المسجلين عبر مختلف الأجهزة لبدء محادثة خاصة أو مجموعة',
    registeredUsers: 'أفراد العائلة المسجلون',
    userNotFound: 'لم يتم العثور على أفراد يطابقون بحثك.',
    connectChat: 'بدء محادثة خاصة',
    addToGroup: 'إضافة إلى مجموعة',
    editNickname: 'تعديل اللقب العائلي',
    nicknameSaved: 'تم حفظ اللقب المخصص بنجاح!',
    saveNickname: 'حفظ اللقب',
    cancel: 'إلغاء',
    createGroupTitle: 'إنشاء مجموعة عائلية جديدة',
    createGroupDesc: 'أنشئ مجموعة دائمة للمنزل، أو الرحلات، أو الأبناء.',
    groupNamePlaceholder: 'اسم المجموعة (مثال: عائلة الأحمد، رحلة العطلة)',
    groupDescPlaceholder: 'وصف المجموعة...',
    selectMembersForCircle: 'اختر الأعضاء المراد إضافتهم للمجموعة:',
    createCircleSubmit: 'إنشاء المجموعة',
    settings: 'الإعدادات والملف الشخصي',
    languageLabel: 'اللغة / Language',
    changeLanguage: 'التبديل إلى الإنجليزية',
    profileCustomization: 'تخصيص الملف الشخصي والصورة',
    uploadNewAvatar: 'رفع صورة شخصية جديدة',
    avatarUpdated: 'تم تحديث صورتك الشخصية عبر شبكة العائلة بنجاح!',
    onlineNow: 'متصل الآن',
    lastSeenRecently: 'نشط مؤخراً',
  },
};
