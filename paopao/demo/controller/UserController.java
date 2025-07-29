package paopao.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        log.info("登录请求：username={}, password={}", user.getUsername(), user.getPassword());
        User dbUser = userService.findByUsername(user.getUsername());
        if (dbUser != null && dbUser.getPassword().equals(user.getPassword())) {

            Map<String,Object> userInfo = new HashMap<>();
            userInfo.put("id", dbUser.getId());
            userInfo.put("name", dbUser.getUsername()); // 添加用户名到JWT中
            String token = JwtUtils.generateToken(userInfo);

            System.out.println(token);
            return ResponseEntity.ok(token);
        }
        return ResponseEntity.status(401).body("用户名或密码错误");
    }
} 