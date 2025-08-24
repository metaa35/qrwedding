const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// JSON dosyası yolu
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Data klasörünü oluştur
const dataDir = path.dirname(USERS_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Kullanıcıları JSON dosyasından oku
const readUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Kullanıcılar okunamadı:', error);
  }
  return [];
};

// Kullanıcıları JSON dosyasına yaz
const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Kullanıcılar yazılamadı:', error);
  }
};

// Kullanıcı sınıfı
class User {
  constructor(data) {
    this._id = data._id || Date.now().toString();
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.companyName = data.companyName;
    this.driveFolderId = data.driveFolderId;
    
    // Yetki alanları
    this.isAdmin = data.isAdmin || false;
    this.canCreateQR = data.canCreateQR || false;
    this.canUploadFiles = data.canUploadFiles || false;
    this.canAccessGallery = data.canAccessGallery || false;
    
    // İletişim bilgileri
    this.phone = data.phone;
    this.website = data.website;
    
    // Hesap durumu
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isVerified = data.isVerified || false;
    this.emailVerified = data.emailVerified || false;
    
    // Zaman damgaları
    this.createdAt = data.createdAt || new Date();
    this.lastLogin = data.lastLogin || new Date();
    this.updatedAt = new Date();
  }

  // Şifre karşılaştırma
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Kullanıcı bilgilerini güvenli şekilde döndürme
  toSafeObject() {
    const userObject = { ...this };
    delete userObject.password;
    return userObject;
  }

  // Yetki kontrolü metodları
  hasPermission(permission) {
    if (this.isAdmin) return true;
    return this[permission] === true;
  }

  canCreateQRCode() {
    return this.hasPermission('canCreateQR');
  }

  hasUploadPermission() {
    return this.hasPermission('canUploadFiles');
  }

  hasGalleryPermission() {
    return this.hasPermission('canAccessGallery');
  }

  // Kullanıcıyı kaydet
  async save() {
    const users = readUsers();
    const existingIndex = users.findIndex(u => u._id === this._id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = this;
    } else {
      users.push(this);
    }
    
    writeUsers(users);
    return this;
  }
}

// Statik metodlar
User.find = (query = {}) => {
  let users = readUsers();
  
  // Basit filtreleme
  if (query.email) {
    users = users.filter(u => u.email === query.email);
  }
  if (query.username) {
    users = users.filter(u => u.username === query.username);
  }
  if (query.isActive !== undefined) {
    users = users.filter(u => u.isActive === query.isActive);
  }
  if (query.isAdmin !== undefined) {
    users = users.filter(u => u.isAdmin === query.isAdmin);
  }
  if (query.canCreateQR !== undefined) {
    users = users.filter(u => u.canCreateQR === query.canCreateQR);
  }
  if (query.canUploadFiles !== undefined) {
    users = users.filter(u => u.canUploadFiles === query.canUploadFiles);
  }
  if (query.canAccessGallery !== undefined) {
    users = users.filter(u => u.canAccessGallery === query.canAccessGallery);
  }
  if (query.createdAt && query.createdAt.$gte) {
    users = users.filter(u => new Date(u.createdAt) >= query.createdAt.$gte);
  }
  
  return users.map(u => new User(u));
};

User.findOne = (query) => {
  const users = User.find(query);
  return users.length > 0 ? users[0] : null;
};

User.findById = (id) => {
  const users = readUsers();
  const user = users.find(u => u._id === id);
  return user ? new User(user) : null;
};

User.findByIdAndDelete = async (id) => {
  const users = readUsers();
  const userIndex = users.findIndex(u => u._id === id);
  
  if (userIndex >= 0) {
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    writeUsers(users);
    return new User(deletedUser);
  }
  
  return null;
};

User.countDocuments = (query = {}) => {
  return User.find(query).length;
};

User.updateMany = async (filter, update) => {
  const users = readUsers();
  let modifiedCount = 0;
  
  users.forEach((user, index) => {
    if (filter._id && filter._id.$in && filter._id.$in.includes(user._id)) {
      Object.assign(users[index], update.$set);
      modifiedCount++;
    }
  });
  
  writeUsers(users);
  return { modifiedCount };
};

// Yeni kullanıcı oluşturma
User.create = async (userData) => {
  // Şifreyi hash'le
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  }
  
  const user = new User(userData);
  await user.save();
  return user;
};

module.exports = User;
