from django.contrib.auth.models import BaseUserManager

class Username_Manager(BaseUserManager):

    def create_user (self, username, password):
        if not username:
            raise ValueError("username is required!")
        user = self.model(username=username)
        user.set_password(password)
        user.save(using= self._db)
        return user

    def create_superuser(self, username, password):
       
        superuser = self.create_user(username=username, password=password)

        superuser.is_superuser = True
        superuser.is_active = True
        superuser.is_staff = True

        superuser.save(using=self._db)
        return superuser