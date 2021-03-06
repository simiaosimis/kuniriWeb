class User < ActiveRecord::Base
	has_many :projects
#	attr_reader :id, :first_name, :email, :last_name, :password_digest, :password_confirmation
	
	#uses the bcrypt algorithm to securely hash a user's password

  has_secure_password

	def send_password_reset
		generate_token(:password_reset_token)
		self.password_reset_sent_at = Time.zone.now
		save!
		UserMailer.password_reset(self).deliver
	end

	def generate_token(column)
		begin
		self[column] = SecureRandom.urlsafe_base64
		end while User.exists?(column => self[column])
	end
end