const bcrypt = require('bcryptjs');
const supabase = require('../services/supabase');

// Kullanıcı sınıfı
class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.company_name = data.company_name;
    this.drive_folder_id = data.drive_folder_id;
    
    // Yetki alanları
    this.is_admin = data.is_admin || false;
    this.can_create_qr = data.can_create_qr || false;
    this.can_upload_files = data.can_upload_files || false;
    this.can_access_gallery = data.can_access_gallery || false;
    
    // İletişim bilgileri
    this.phone = data.phone;
    this.website = data.website;
    
    // Hesap durumu
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.is_verified = data.is_verified || false;
    this.email_verified = data.email_verified || false;
    
    // Zaman damgaları
    this.created_at = data.created_at || new Date();
    this.last_login = data.last_login || new Date();
    this.updated_at = new Date();
  }

  // Şifre karşılaştırma
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password_hash);
  }

  // Kullanıcı bilgilerini güvenli şekilde döndürme
  toSafeObject() {
    const userObject = { ...this };
    delete userObject.password_hash;
    return userObject;
  }

  // Yetki kontrolü metodları
  hasPermission(permission) {
    if (this.is_admin) return true;
    return this[permission] === true;
  }

  canCreateQRCode() {
    return this.hasPermission('can_create_qr');
  }

  hasUploadPermission() {
    return this.hasPermission('can_upload_files');
  }

  hasGalleryPermission() {
    return this.hasPermission('can_access_gallery');
  }

  // Kullanıcıyı kaydet
  async save() {
    try {
      const userData = {
        username: this.username,
        email: this.email,
        password_hash: this.password_hash,
        company_name: this.company_name,
        drive_folder_id: this.drive_folder_id,
        is_admin: this.is_admin,
        can_create_qr: this.can_create_qr,
        can_upload_files: this.can_upload_files,
        can_access_gallery: this.can_access_gallery,
        phone: this.phone,
        website: this.website,
        is_active: this.is_active,
        is_verified: this.is_verified,
        email_verified: this.email_verified,
        last_login: this.last_login,
        updated_at: this.updated_at
      };

      if (this.id) {
        // Güncelleme
        const { data, error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', this.id)
          .select()
          .single();

        if (error) throw error;
        return new User(data);
      } else {
        // Yeni kullanıcı
        const { data, error } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();

        if (error) throw error;
        
        // Yeni oluşturulan kullanıcının id'sini ata
        this.id = data.id;
        return new User(data);
      }
    } catch (error) {
      console.error('Kullanıcı kaydetme hatası:', error);
      throw error;
    }
  }
}

// Statik metodlar
User.find = async (query = {}) => {
  try {
    let supabaseQuery = supabase.from('users').select('*');
    
    // Filtreleme
    if (query.email) {
      supabaseQuery = supabaseQuery.eq('email', query.email);
    }
    if (query.username) {
      supabaseQuery = supabaseQuery.eq('username', query.username);
    }
    if (query.is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', query.is_active);
    }
    if (query.is_admin !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_admin', query.is_admin);
    }
    
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    
    return data.map(user => new User(user));
  } catch (error) {
    console.error('Kullanıcı arama hatası:', error);
    return [];
  }
};

User.findOne = async (query) => {
  try {
    let supabaseQuery = supabase.from('users').select('*');
    
    // Tek bir kriter için direkt sorgu yap
    if (query.email) {
      const { data, error } = await supabaseQuery.eq('email', query.email).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data ? new User(data) : null;
    }
    
    if (query.username) {
      const { data, error } = await supabaseQuery.eq('username', query.username).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data ? new User(data) : null;
    }
    
    // Diğer kriterler için genel sorgu
    if (query.is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', query.is_active);
    }
    if (query.is_admin !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_admin', query.is_admin);
    }
    
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    
    return data.length > 0 ? new User(data[0]) : null;
  } catch (error) {
    console.error('Kullanıcı bulma hatası:', error);
    return null;
  }
};

User.findById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? new User(data) : null;
  } catch (error) {
    console.error('Kullanıcı ID ile bulma hatası:', error);
    return null;
  }
};

User.findByIdAndDelete = async (id) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data ? new User(data) : null;
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    return null;
  }
};

User.countDocuments = async (query = {}) => {
  try {
    const users = await User.find(query);
    return users.length;
  } catch (error) {
    console.error('Kullanıcı sayma hatası:', error);
    return 0;
  }
};

User.updateMany = async (filter, update) => {
  try {
    let supabaseQuery = supabase.from('users').update(update.$set);
    
    if (filter._id && filter._id.$in) {
      supabaseQuery = supabaseQuery.in('id', filter._id.$in);
    }
    
    const { data, error } = await supabaseQuery.select();
    if (error) throw error;
    
    return { modifiedCount: data.length };
  } catch (error) {
    console.error('Toplu güncelleme hatası:', error);
    return { modifiedCount: 0 };
  }
};

// Yeni kullanıcı oluşturma
User.create = async (userData) => {
  try {
    // Şifreyi hash'le
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password_hash = await bcrypt.hash(userData.password, salt);
      delete userData.password;
    }
    
    // Varsayılan yetkiler (yeni kullanıcılar için)
    userData.can_create_qr = userData.can_create_qr || false;
    userData.can_upload_files = userData.can_upload_files || false;
    userData.can_access_gallery = userData.can_access_gallery || false;
    userData.is_admin = userData.is_admin || false;
    userData.is_active = userData.is_active !== undefined ? userData.is_active : true;
    userData.is_verified = userData.is_verified || false;
    userData.email_verified = userData.email_verified || false;
    
    // Supabase'e direkt insert yap
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    
    return new User(data);
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    throw error;
  }
};

module.exports = User;
