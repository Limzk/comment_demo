$(function() {
        $('#reg').on('submit', function (e) {
            e.preventDefault()
            if ($("input[type='text']").val() === '') {
                alert('用户名不能为空！')
            } else if ($("input[type='password']").val() === '') {
                alert('密码不能为空！')
            } else {
                var fromData = $(this).serialize()
                $.ajax({
                    url: '/register',
                    type: 'post',
                    data: fromData,
                    dataType: 'json',
                    success: function (data) {
                        if (data.code_State === 500) {
                            alert("服务器发生错误")
                        } else if (data.code_State === 1) {
                            alert("该用户名已存在")
                            $("input[type='text']").val('')
                            $("input[type='password']").val('')
                        } else {
                            alert("注册成功！！！")
                            window.location.href ='/login'
                        }
                    }
                })
            }
        })
    })