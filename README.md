# poicreator

Create POIs

```
img
├── 01.jpg
├── 21.jpg
└── 22.jpg
```


A(01.jpg):

    ![](http://gnat.qiniudn.com/pano/01.jpg?imageView2/2/h/200)

B(21.jpg):

    ![](http://gnat.qiniudn.com/pano/21.jpg?imageView2/2/h/200)

C(22.jpg):

    ![](http://gnat.qiniudn.com/pano/22.jpg?imageView2/2/h/200)

```
        ^ y
        |
        +---+---+---+
        |   |   | C |
        +---+---+---+
        | A |   | B |
        +---+---+---+
        |   |   |   |
  (0,0) +---+---+---+--> x
```


### [Image Processing](https://zybuluo.com/gnat-xj/note/92390)

```
http://gnat.qiniudn.com/pano/01.jpg?imageView2/2/h/200
```

### img

http://gnat.qiniudn.com/pano.jpg


# Compressing Off
wired.

# Compressing On
➜  ~  curl  http://localhost:8000/gridfs/level0-12000x6000.jpg > /dev/null 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 9195k    0 9195k    0     0  54.7M      0 --:--:-- --:--:-- --:--:-- 54.7M

➜  ~  curl  http://localhost:8000/gridfs/level0-12000x6000.jpg > /dev/null
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 9195k    0 9195k    0     0  40.5M      0 --:--:-- --:--:-- --:--:-- 40.6M
➜  ~  curl -H "Accept-Encoding:gzip" http://localhost:8000/gridfs/level0-12000x6000.jpg > /dev/null 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 9195k    0 9195k    0     0  44.5M      0 --:--:-- --:--:-- --:--:-- 44.6M
➜  ~  curl -H "Accept-Encoding:gzip" http://localhost:8000/gridfs/level0-12000x6000.jpg > /dev/null
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 9195k    0 9195k    0     0  47.8M      0 --:--:-- --:--:-- --:--:-- 48.0M
➜  ~  curl -H "Accept-Encoding:gzip" http://localhost:8000/gridfs/level0-12000x6000.jpg > /dev/null
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 9195k    0 9195k    0     0  43.7M      0 --:--:-- --:--:-- --:--:-- 43.8M
➜  ~  curl -H "Accept-Encoding:gzip" http://localhost:8000/gridfs/level0-12000x6000.jpg > /dev/null
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 9195k    0 9195k    0     0  47.7M      0 --:--:-- --:--:-- --:--:-- 47.7M
➜  ~  curl http://localhost:8000/gridfs/level0-12000x6000.jpg > /dev/null 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 9195k    0 9195k    0     0  41.8M      0 --:--:-- --:--:-- --:--:-- 41.9M
