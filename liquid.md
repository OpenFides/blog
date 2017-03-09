---
layout: master
title: Liquid指南
---

<a href='http://feeds.feedburner.com/JoinTheConversation' class='float-right'><img src='/images/subscribe.png' alt='Subscribe to XML Feed'/></a>

{% for post in site.posts.basics %}
  <div class='post'>
    <span class='date'>{{post.date | date:"%Y-%m-%d"}}</span>
    <h1><a href='{{post.url}}'>{{post.title}}</a></h1>
    <div class='body'>{{post.content}}</div>
    <a href='{{post.url}}#disqus_thread'>查看评论</a>
  </div>
{% endfor %}

{% for post in site.posts.filters %}
  <div class='post'>
    <span class='date'>{{post.date | date:"%Y-%m-%d"}}</span>
    <h1><a href='{{post.url}}'>{{post.title}}</a></h1>
    <div class='body'>{{post.content}}</div>
    <a href='{{post.url}}#disqus_thread'>查看评论</a>
  </div>
{% endfor %}

{% for post in site.posts.tags %}
  <div class='post'>
    <span class='date'>{{post.date | date:"%Y-%m-%d"}}</span>
    <h1><a href='{{post.url}}'>{{post.title}}</a></h1>
    <div class='body'>{{post.content}}</div>
    <a href='{{post.url}}#disqus_thread'>查看评论</a>
  </div>
{% endfor %}

</table>
