from django.db import models


class Categoria(models.Model):
  name = models.CharField(max_length=100)
  
  
  def __str__(self):
      return self.name


class Produto(models.Model):
  name = models.CharField(max_length=255)
  price = models.IntegerField()
  description = models.CharField(max_length=255)
  categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True,related_name='produtos')
  image = models.ImageField(upload_to='produtos/', blank=True, null=True)  

  def __str__(self):
    return self.name