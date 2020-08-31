---
layout: post
title:  css header 自动编号
---

 除

使用css让header自动编号：

```html
    <style>
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            margin: 0;
            padding: 0;
            font-weight: normal;
        }

        h1::before,
        h2::before,
        h3::before,
        h4::before,
        h6::before,
        h6::before {
            padding-right: 1em;          
        }


        h1 {
            counter-increment: h1;
               padding-left: 1em;
            counter-reset: h2
        }

        h2 {
            counter-increment: h2;
              padding-left:2em;
            counter-reset: h3
        }

        h3 {   counter-increment: h3;
            padding-left: 3em;
            counter-reset: h4
        }

        h4 {   counter-increment: h4;
            padding-left: 4em;
            counter-reset: h5
        }

        h5 {   counter-increment: h5;
            padding-left: 5em;
            counter-reset: h6
        }
        h6 {
            counter-increment: h6; padding-left: 6em;
            /* counter-reset: h7 */
        }
 

        h1::before {
            content: counter(h1)".";
        }
 

        h2::before {
            content: counter(h1)"."counter(h2)".";
        }
 
        h3::before {
            content: counter(h1)"."counter(h2)"."counter(h3)".";
        } 

        h4::before {
            content: counter(h1)"."counter(h2)"."counter(h3)"."counter(h4)".";
        }
 

        h5::before {
            content: counter(h1)"."counter(h2)"."counter(h3)"."counter(h4)"."counter(h5)".";
        }
 
        h6::before {
            content: counter(h1)"."counter(h2)"."counter(h3)"."counter(h4)"."counter(h5)"."counter(h6)".";
        }
    </style>
```

在typra中的实现：vim user.base.css

```css
/** initialize css counter */
#write {
    counter-reset: h1
}

h1 {
    counter-reset: h2
}

h2 {
    counter-reset: h3
}

h3 {
    counter-reset: h4
}

h4 {
    counter-reset: h5
}

h5 {
    counter-reset: h6
}

/** put counter result into headings */
#write h1:before {
    counter-increment: h1;
    content: counter(h1) ". "
}

#write h2:before {
    counter-increment: h2;
    content: counter(h1) "." counter(h2) ". "
}

#write h3:before,
h3.md-focus.md-heading:before /** override the default style for focused headings */ {
    counter-increment: h3;
    content: counter(h1) "." counter(h2) "." counter(h3) ". "
}

#write h4:before,
h4.md-focus.md-heading:before {
    counter-increment: h4;
    content: counter(h1) "." counter(h2) "." counter(h3) "." counter(h4) ". "
}

#write h5:before,
h5.md-focus.md-heading:before {
    counter-increment: h5;
    content: counter(h1) "." counter(h2) "." counter(h3) "." counter(h4) "." counter(h5) ". "
}

#write h6:before,
h6.md-focus.md-heading:before {
    counter-increment: h6;
    content: counter(h1) "." counter(h2) "." counter(h3) "." counter(h4) "." counter(h5) "." counter(h6) ". "
}

/** override the default style for focused headings */
#write>h3.md-focus:before,
#write>h4.md-focus:before,
#write>h5.md-focus:before,
#write>h6.md-focus:before,
h3.md-focus:before,
h4.md-focus:before,
h5.md-focus:before,
h6.md-focus:before {
    color: inherit;
    border: inherit;
    border-radius: inherit;
    position: inherit;
    left:initial;
    float: none;
    top:initial;
    font-size: inherit;
    padding-left: inherit;
    padding-right: inherit;
    vertical-align: inherit;
    font-weight: inherit;
    line-height: inherit;
}
```




