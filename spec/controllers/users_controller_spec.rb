require 'rails_helper'

describe UsersController do
	let(:user_info_all_correct) {{
		first_name: 		   "Luciano",
        last_name:  		   "Almeida",
        email: 				   "admin@admin",
        password:              "admin",
		password_confirmation: "admin",
	    admin: 				   true }}
	let(:user_info_wrong_pw) {{
		first_name: 		   "Luciano",
        last_name:  		   "Almeida",
        email: 				   "admin@admin",
        password:              "user",
		password_confirmation: "admin",
	    admin: 				   true }}
	let(:user_info_email_exists) {{
		first_name: 		   "Luciano",
        last_name:  		   "Henrique",
        email: 				   "admin@admin",
        password:              "123",
		password_confirmation: "123",
	    admin: 				   true }}
	
	let (:user) { User.create! user_info_all_correct }
	let (:new_user) { User.new }

	describe '#index' do
		context 'when there are users' do
			before(:each) { get :index }
			it 'expects to render get index template' do
				expect(response).to render_template :index
			end
			it 'expects to list all users' do
				expect(assigns(:users)).to match_array user
			end
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
		context 'when you want to create a new user' do
			it 'expects to render get new template' do
				get :new
				expect(response).to render_template :new
			end
		end
	end

	describe '#create' do
		context 'when the user does not exist' do
			before(:each) { post :create, user: user_info_all_correct }
			it 'expects to redirect to /kuniri on successful save' do
				expect(flash[:notice]).to be_blank
				expect(response).to redirect_to '/kuniri'
			end
		end
		context 'when password and password_confirmation does not match' do
			before(:each) { post :create, user: user_info_wrong_pw }
			it 'expects to re-render /sign_up and show error_message' do
				expect(flash[:notice]).not_to be_blank
				expect(flash[:notice]).to eq 'password do not match!'
				expect(response).to redirect_to '/sign_up'
			end
		end
		context 'when the email is already taken' do
			before(:each) { post :create, user: user_info_all_correct }
			it 'expects to re-render /sign_up and show error_message' do
				post :create, user: user_info_email_exists
				expect(flash[:notice]).not_to be_blank
				expect(flash[:notice]).to eq 'e-mail was alredy registered'
				expect(response).to redirect_to '/sign_up'
			end
		end
	end

	describe '#edit' do
		#before(:each) { get :edit, id: user.id }
		it 'expects to render post edit template' do
			#expect(response).to render_template :edit
		end
	end
end