from flask import Flask, render_template, request, json, flash, redirect, url_for, session, logging
from flaskext.mysql import MySQL
from passlib.hash import sha256_crypt
from wtforms import Form, StringField, TextAreaField, PasswordField, validators
from pymysql.cursors import DictCursor
from functools import wraps
import os



app = Flask(__name__);



file = open("MySQLDBPassword.txt",encoding='utf-8');
sqlpass = str(file.readline());
file.close();


# Config MySQL
mysql = MySQL(cursorclass=DictCursor);
app.config['MYSQL_HOST'] = 'localhost';
app.config['MYSQL_DATABASE_USER'] = 'root';
app.config['MYSQL_DATABASE_PASSWORD'] = sqlpass[:-1];
app.config['MYSQL_DATABASE_DB'] = 'StudyWithMe';

#init MySQL
mysql.init_app(app);



# Home Page
@app.route('/')
def home():
    return render_template("home.html");

# About
@app.route('/about')
def about():
    return render_template("about.html");


# Register Form Class
class RegisterForm(Form):
    name = StringField('Name',[validators.Length(min=1,max=50)]);
    username = StringField('Username', [validators.Length(min=4,max=25)]);
    email = StringField('Email', [validators.Length(min=6,max=50)]);
    password = PasswordField('Password',[
        validators.DataRequired(),
        validators.EqualTo('confirm',message='Passwords do not match')
    ]);

    confirm = PasswordField('Confirm Password');


# User Register
@app.route('/register',methods=['GET','POST'])
def register():

    form = RegisterForm(request.form)

    if request.method == 'POST' and form.validate():
        name = form.name.data;
        email = form.email.data;
        username = form.username.data;
        password = sha256_crypt.hash(str(form.password.data));

        # Create cursor and connection
        conn = mysql.connect();
        cursor = conn.cursor();

        # First check to see if the username or email address already exists within the MYSQL_DATABASE_DB

        resultOfUsernames = cursor.execute("SELECT * FROM users WHERE username=%s;",(username,));

        resultOfEmails = cursor.execute("SELECT * FROM users WHERE email=%s",(email,));

        if resultOfUsernames > 0:
            cursor.close();
            error="Username already exists";
            return render_template('register.html',form=form,error=error);

        elif resultOfEmails > 0:
            cursor.close();
            error="Email already exists";
            return render_template('register.html',form=form,error=error);

        cursor.execute("INSERT INTO users(name,email,username, password) VALUES(%s,%s,%s,%s);",(name, email, username, password));

        # Commit to db
        conn.commit();

        # Close connection
        cursor.close();

        flash("You are now registered and can log in",'success');



    return render_template('register.html', form=form);



# User login
@app.route('/login',methods=['GET','POST'])
def login():
    if request.method == 'POST':
        # Get Form Fields
        username = request.form['username']
        password_candidate = request.form['password'];

        # Create Cursor and connection
        conn = mysql.connect();
        cursor = conn.cursor();

        # Get user by Username
        result = cursor.execute("SELECT * FROM users WHERE username=%s;",(username,));

        if result > 0:
            # Get stored hash
            data = cursor.fetchone();
            password = data['Password'];

            # Compare Passwords
            if sha256_crypt.verify(password_candidate,password):

                # Passed
                session['logged_in'] = True;
                session['username'] = username;

                flash('You are now logged in', 'success')
                return redirect(url_for('dashboard'));
            else:
                error="Invalid login"
                return render_template('login.html',error=error)
            # Close connection
            cursor.close();
        else:
            error="Username not found"
            cursor.close();
            return render_template('login.html',error=error)

    return render_template('login.html');



# Check if user logged in
def is_logged_in(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            return redirect(url_for('login'))
    return wrap


@app.route('/logout')
def logout():
    session.clear();
    flash('You are now logged out', "success");
    return redirect(url_for('login'));


@app.route('/dashboard')
@is_logged_in
def dashboard():
    return render_template('dashboard.html');

@app.route('/calendar')
@is_logged_in
def calendar():
    return render_template('calendar.html');

@app.route('/pomodoro')
@is_logged_in
def pomodoro():
    return render_template('pomodoro.html');

@app.route('/scrumBoard')
@is_logged_in
def scrumBoard():
    return render_template('scrumBoard.html');


@app.route('/report')
@is_logged_in
def report():
    return render_template('report.html');


if __name__ == '__main__':
    app.secret_key = 'secret123'
    app.run(debug=True);
