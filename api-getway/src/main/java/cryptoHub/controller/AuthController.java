package cryptoHub.controller;

import cryptoHub.dto.CacheUserDto;
import cryptoHub.dto.LoginRequestDto;
import cryptoHub.dto.LoginResponseDto;
import cryptoHub.entity.UserEntity;
import cryptoHub.lib.AppConstants;
import cryptoHub.repository.UserRepository;
import cryptoHub.service.AuthUserService;
import cryptoHub.service.RedisService;
import cryptoHub.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthUserService authUserService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RedisService redisService;

    @PostMapping("/register")
    public ResponseEntity<UserEntity> registerUser(@RequestBody UserEntity userPayload) throws Exception {
        String identifier = userPayload.getEmail();
        if (identifier.isBlank()) identifier = userPayload.getUsername();
        UserEntity isUserExist = userRepository.findUserByUsernameOrEmail(userPayload.getUsername(), userPayload.getEmail());
        if (isUserExist != null) {
            throw new Exception(identifier + " Already used for Account Creation please try something different");
        }
        UserEntity user = authUserService.registerUser(userPayload);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<LoginResponseDto> loginUser(@RequestBody LoginRequestDto loginRequestDto) throws Exception {
        UserEntity user = authUserService.loadUserByUsername(loginRequestDto.getEmail());
        if (user == null) {
            throw new Exception("User not found with " + loginRequestDto.getEmail());
        }
        boolean isCredentialsValid = authUserService.isCredentialsValid(loginRequestDto);

        if (!isCredentialsValid) {
            throw new Exception("Provided credentials are invalid...!");
        }

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                loginRequestDto.getEmail(), loginRequestDto.getPassword()
        );
        Authentication authResult = authenticationManager.authenticate(authentication);
        SecurityContextHolder.getContext().setAuthentication(authResult);

        String accessToken = jwtUtil.generateJwtToken(loginRequestDto.getEmail(), user.getId(), AppConstants.ACCESS_TOKEN_EXPIRY_IN_MINUTES);
        String refreshToken = jwtUtil.generateJwtToken(loginRequestDto.getEmail(), user.getId(), AppConstants.REFRESH_TOKEN_EXPIRY_IN_MINUTES);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
        double userAmount = user.getAmount() == null ? 0 : user.getAmount();
        CacheUserDto cacheUserDto = CacheUserDto.builder().
                userId(user.getId()).email(user.getEmail()).amount(userAmount).build();
        redisService.cacheUser(cacheUserDto);
        LoginResponseDto loginResponse = LoginResponseDto.builder()
                .id(user.getId())
                .accessToken(accessToken)
                .refreshToken(user.getRefreshToken())
                .build();
        return ResponseEntity.ok(loginResponse);
    }
}
