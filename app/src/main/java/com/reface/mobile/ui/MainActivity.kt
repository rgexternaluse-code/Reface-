package com.reface.mobile.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.reface.mobile.ui.home.HomeScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RefaceTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF090A0F)
                ) {
                    HomeScreen()
                }
            }
        }
    }
}

@Composable
fun RefaceTheme(content: @Composable () -> Unit) {
    val darkColors = darkColorScheme(
        primary = Color(0xFF6366F1),
        secondary = Color(0xFF8B5CF6),
        background = Color(0xFF090A0F),
        surface = Color(0xFF12141C),
        onPrimary = Color.White,
        onBackground = Color(0xFFF1F5F9),
        onSurface = Color(0xFFF1F5F9)
    )

    MaterialTheme(
        colorScheme = darkColors,
        content = content
    )
}
