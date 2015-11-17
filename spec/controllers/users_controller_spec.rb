require 'rails_helper'

describe UsersController do
	let(:user1) {{
		first_name: 		   "Luciano",
        last_name:  		   "Almeida",
        email: 				   "admin@admin",
        password:              "admin",
		password_confirmation: "admin",
	    admin: 				   true }}
	let (:user) { User.create! user1 }

	describe '#index' do
		before(:each) { get :index }

		it 'expects to render get index template' do
			expect(response).to render_template :index
		end
		it 'expects to list all users' do
			expect(assigns(:users)).to match_array user
		end
	end

	describe '#show' do
		context 'when the user exist' do
			before(:each) { get :show, id: user.id }

			it 'expects to render get show template' do
				expect(response).to render_template :show
			end
			it 'expects to find a user by its id' do
				expect(assigns(:user)).to eq user
			end
		end
		context 'when the user does not exist' do
			it 'expects raise exception when id is wrong' do
	        	expect{ get :show, id: -1 }.to raise_exception ActiveRecord::RecordNotFound
			end
		end
	end

	describe '#new' do
		before(:each) { get :new }

		it 'expects to render get new template' do
			expect(response).to render_template :new
		end
		it 'expects to create a new user' do pending = true
			# new_user = User.new
			# expect(assigns(:user)).to eq new_user
		end
	end
end